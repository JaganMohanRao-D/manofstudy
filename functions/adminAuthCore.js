"use strict";

/**
 * Private Naa College owner-portal authentication core.
 *
 * The browser signs in with Firebase email/password and calls a callable
 * function. Everything that grants access is decided here, on the server:
 *   - the Firebase ID token (already verified by the callable runtime),
 *   - the live Firebase user record (disabled / revoked / provider / verified),
 *   - an opaque server-side session whose SHA-256 hash is the Firestore doc ID.
 *
 * Dependencies are injected so the logic can be unit-tested without Firebase.
 * Nothing in this file logs or stores passwords, ID tokens or raw session tokens.
 */

const crypto = require("node:crypto");

// Resolved lazily so unit tests can run without the Firebase packages installed
// (they inject a structurally identical stand-in via setHttpsErrorForTesting).
let HttpsErrorImpl = null;
function HttpsErrorClass() {
  if (!HttpsErrorImpl) HttpsErrorImpl = require("firebase-functions/v2/https").HttpsError;
  return HttpsErrorImpl;
}
function setHttpsErrorForTesting(cls) {
  HttpsErrorImpl = cls;
}
function makeError(code, message, details) {
  return new (HttpsErrorClass())(code, message, details);
}

const ADMIN_OWNER_EMAIL = "jaganmakes@gmail.com";
const ADMIN_SESSION_COLLECTION = "private_admin_sessions";
const ADMIN_RATE_LIMIT_COLLECTION = "private_admin_rate_limits";
const ADMIN_SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const ADMIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_MAX_ATTEMPTS_PER_WINDOW = 8;
// A session may only be minted from a sign-in that happened moments ago.
const ADMIN_MAX_LOGIN_AGE_MS = 5 * 60 * 1000;
const ADMIN_PASSWORD_PROVIDER = "password";

const NOT_AUTHORIZED_MESSAGE = "This account is not authorized.";

/**
 * Exact, case-insensitive comparison only. Gmail dot/plus aliasing is
 * deliberately NOT applied: "jagan.makes@gmail.com" is a different Firebase
 * identity and must not be treated as the owner.
 */
function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function denied(reason) {
  // `reason` is only attached for states the caller has already proven they own
  // (correct owner email + valid password), never for arbitrary accounts.
  return makeError(
    "permission-denied",
    NOT_AUTHORIZED_MESSAGE,
    reason ? { reason } : undefined
  );
}

/**
 * Pure token-claim evaluation. Returns { ok: true, uid } or { ok: false, error }.
 */
function evaluateTokenClaims(authContext) {
  if (!authContext || typeof authContext.uid !== "string" || !authContext.uid) {
    return {
      ok: false,
      error: makeError("unauthenticated", "Please sign in to continue."),
    };
  }
  const token = authContext.token || {};
  const email = normalizeEmail(token.email);
  if (email !== ADMIN_OWNER_EMAIL) {
    return { ok: false, error: denied() };
  }
  if (token.email_verified !== true) {
    return { ok: false, error: denied("email-not-verified") };
  }
  const provider = token.firebase && token.firebase.sign_in_provider;
  if (provider !== ADMIN_PASSWORD_PROVIDER) {
    return { ok: false, error: denied() };
  }
  return { ok: true, uid: authContext.uid };
}

/**
 * Pure evaluation of the live Firebase user record against the token.
 */
function evaluateUserRecord(userRecord, authContext) {
  if (!userRecord) return { ok: false, error: denied() };
  if (userRecord.disabled === true) return { ok: false, error: denied() };
  if (normalizeEmail(userRecord.email) !== ADMIN_OWNER_EMAIL) {
    return { ok: false, error: denied() };
  }
  if (userRecord.emailVerified !== true) {
    return { ok: false, error: denied("email-not-verified") };
  }
  const providers = Array.isArray(userRecord.providerData) ? userRecord.providerData : [];
  if (!providers.some((p) => p && p.providerId === ADMIN_PASSWORD_PROVIDER)) {
    return { ok: false, error: denied() };
  }
  // Reject ID tokens issued before the user's tokens were revoked/reset.
  const validAfterMs = Date.parse(userRecord.tokensValidAfterTime || "");
  const authTimeSec = Number(authContext.token && authContext.token.auth_time);
  if (Number.isFinite(validAfterMs) && Number.isFinite(authTimeSec) &&
      authTimeSec * 1000 < validAfterMs) {
    return { ok: false, error: makeError("unauthenticated", "Please sign in again.") };
  }
  return { ok: true };
}

function createAdminAuth({ db, auth, FieldValue, now = () => Date.now(), logger = console }) {
  function hashSessionToken(token) {
    return crypto.createHash("sha256").update(token, "utf8").digest("hex");
  }

  function isPlausibleSessionToken(token) {
    return typeof token === "string" && token.length >= 40 && token.length <= 128;
  }

  // Log only sanitized stage/code/message details. Never request bodies,
  // ID tokens, passwords or session tokens.
  function logFailure(functionName, stage, error) {
    const code = error && typeof error.code === "string" ? error.code : "unknown";
    const message = error && typeof error.message === "string"
      ? error.message
      : "Unspecified server error";
    const stack = error && typeof error.stack === "string" ? error.stack : undefined;
    logger.error("[NaaAdminAuth] Unexpected server failure", {
      functionName,
      stage,
      code,
      message,
      ...(stack ? { stack } : {}),
    });
  }

  function rateLimitRef(purpose, subject) {
    const id = crypto.createHash("sha256").update(purpose + ":" + subject).digest("hex");
    return db.collection(ADMIN_RATE_LIMIT_COLLECTION).doc(id);
  }

  function requestSource(request) {
    const rawIp = request && request.rawRequest && request.rawRequest.ip;
    return typeof rawIp === "string" && rawIp.length ? rawIp : "unknown";
  }

  /**
   * Fixed-window limiter with a temporary (never permanent) lockout.
   * Counts every attempt; the caller clears the bucket after a success.
   */
  async function enforceRateLimit(purpose, subject) {
    const ref = rateLimitRef(purpose, subject);
    const current = now();
    const decision = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const existing = snapshot.exists ? snapshot.data() : {};
      if (Number(existing.lockedUntilMs) > current) return { blocked: true };

      let windowStartedAtMs = Number(existing.windowStartedAtMs) || current;
      let attempts = Number(existing.attempts) || 0;
      if (current - windowStartedAtMs >= ADMIN_RATE_WINDOW_MS) {
        windowStartedAtMs = current;
        attempts = 0;
      }
      if (attempts >= ADMIN_MAX_ATTEMPTS_PER_WINDOW) {
        transaction.set(ref, {
          attempts,
          windowStartedAtMs,
          lockedUntilMs: current + ADMIN_RATE_WINDOW_MS,
          updatedAtMs: current,
        });
        return { blocked: true };
      }
      transaction.set(ref, {
        attempts: attempts + 1,
        windowStartedAtMs,
        lockedUntilMs: 0,
        updatedAtMs: current,
      });
      return { blocked: false };
    });

    if (decision.blocked) {
      throw makeError(
        "resource-exhausted",
        "Too many sign-in attempts. Please wait 15 minutes before trying again."
      );
    }
    return ref;
  }

  /**
   * Full server-side owner authorization. Never trusts client-supplied
   * email/uid/role fields: only the verified token and the live user record.
   */
  async function assertOwnerIdentity(authContext, { requireFreshLogin = false } = {}) {
    const claims = evaluateTokenClaims(authContext);
    if (!claims.ok) throw claims.error;

    if (requireFreshLogin) {
      const authTimeSec = Number(authContext.token && authContext.token.auth_time);
      if (!Number.isFinite(authTimeSec) ||
          now() - authTimeSec * 1000 > ADMIN_MAX_LOGIN_AGE_MS) {
        throw makeError("unauthenticated", "Please sign in again.", { reason: "reauth-required" });
      }
    }

    let userRecord;
    try {
      userRecord = await auth.getUser(claims.uid);
    } catch (error) {
      if (error && error.code === "auth/user-not-found") throw denied();
      throw error;
    }
    const record = evaluateUserRecord(userRecord, authContext);
    if (!record.ok) throw record.error;
    return { uid: claims.uid };
  }

  async function createSession(uid) {
    const sessionToken = crypto.randomBytes(32).toString("base64url");
    const createdAtMs = now();
    const expiresAtMs = createdAtMs + ADMIN_SESSION_LIFETIME_MS;
    await db.collection(ADMIN_SESSION_COLLECTION).doc(hashSessionToken(sessionToken)).set({
      uid,
      provider: ADMIN_PASSWORD_PROVIDER,
      createdAt: FieldValue.serverTimestamp(),
      createdAtMs,
      expiresAtMs,
      // Real timestamp so an optional Firestore TTL policy can purge old sessions.
      expireAt: new Date(expiresAtMs),
    });
    return { sessionToken, expiresAtMs };
  }

  async function getValidSession(sessionToken, expectedUid) {
    if (!isPlausibleSessionToken(sessionToken) || !expectedUid) return null;
    const ref = db.collection(ADMIN_SESSION_COLLECTION).doc(hashSessionToken(sessionToken));
    const snapshot = await ref.get();
    if (!snapshot.exists) return null;

    const session = snapshot.data() || {};
    if (Number(session.expiresAtMs) <= now()) {
      await ref.delete().catch(() => {});
      return null;
    }
    if (session.uid !== expectedUid || session.provider !== ADMIN_PASSWORD_PROVIDER) {
      return null;
    }
    return { ref, uid: session.uid };
  }

  /**
   * Gate for EVERY privileged admin operation (current and future):
   * owner identity + a live server-side session, both verified here.
   */
  async function requireAdminSession(request) {
    const owner = await assertOwnerIdentity(request.auth);
    const session = await getValidSession(request.data && request.data.sessionToken, owner.uid);
    if (!session) {
      throw makeError("unauthenticated", "Your admin session has expired. Please sign in again.");
    }
    return { uid: owner.uid, session };
  }

  function rethrowSafely(functionName, stage, error, publicMessage) {
    if (error instanceof (HttpsErrorClass()) && error.code !== "internal") throw error;
    logFailure(functionName, stage, error);
    throw makeError("internal", publicMessage);
  }

  async function login(request) {
    let stage = "rate-limit-source";
    try {
      const sourceRef = await enforceRateLimit("password-login", requestSource(request));

      // Authenticated-but-unauthorized callers (e.g. any student account) are
      // also throttled per UID, without letting them lock out the owner.
      let uidRef = null;
      const callerUid = request.auth && request.auth.uid;
      if (typeof callerUid === "string" && callerUid) {
        stage = "rate-limit-uid";
        uidRef = await enforceRateLimit("password-login-uid", callerUid);
      }

      stage = "owner-identity";
      const owner = await assertOwnerIdentity(request.auth, { requireFreshLogin: true });

      stage = "create-session";
      const { sessionToken, expiresAtMs } = await createSession(owner.uid);

      stage = "clear-rate-limit";
      await Promise.all([
        sourceRef.delete().catch(() => {}),
        uidRef ? uidRef.delete().catch(() => {}) : Promise.resolve(),
      ]);

      return { sessionToken, expiresAt: new Date(expiresAtMs).toISOString() };
    } catch (error) {
      return rethrowSafely(
        "loginWithPasswordNaaAdmin",
        stage,
        error,
        "Admin sign-in could not be completed. Please try again."
      );
    }
  }

  async function verify(request) {
    let stage = "session-check";
    try {
      await requireAdminSession(request);
      return { valid: true };
    } catch (error) {
      return rethrowSafely(
        "verifyNaaAdminSession",
        stage,
        error,
        "Admin session could not be verified. Please sign in again."
      );
    }
  }

  async function logout(request) {
    let stage = "owner-identity";
    try {
      const owner = await assertOwnerIdentity(request.auth);
      stage = "revoke-refresh-tokens";
      // Revoke Firebase refresh tokens as well as signing out the current
      // browser. assertOwnerIdentity checks tokensValidAfterTime on all
      // privileged requests, so previously issued ID tokens are rejected.
      await auth.revokeRefreshTokens(owner.uid);
      return { success: true };
    } catch (error) {
      return rethrowSafely(
        "logoutNaaAdmin",
        stage,
        error,
        "Sign-out could not be fully confirmed. Please try again."
      );
    }
  }

  return {
    login,
    verify,
    logout,
    requireAdminSession,
    assertOwnerIdentity,
    createSession,
    getValidSession,
    hashSessionToken,
  };
}

module.exports = {
  createAdminAuth,
  evaluateTokenClaims,
  evaluateUserRecord,
  normalizeEmail,
  setHttpsErrorForTesting,
  ADMIN_OWNER_EMAIL,
  ADMIN_SESSION_COLLECTION,
  ADMIN_RATE_LIMIT_COLLECTION,
  ADMIN_SESSION_LIFETIME_MS,
  ADMIN_RATE_WINDOW_MS,
  ADMIN_MAX_ATTEMPTS_PER_WINDOW,
  ADMIN_MAX_LOGIN_AGE_MS,
};
