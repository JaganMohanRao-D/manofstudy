"use strict";

// Run with: node --test functions/adminAuthCore.test.js   (no dependencies needed)
//
// These tests exercise the real handlers in adminAuthCore.js against an
// in-memory Firestore and a fake Firebase Admin Auth. HttpsError is a
// structurally identical stand-in so the suite runs without installing the
// Firebase packages. Password verification itself (wrong password, unknown
// user) is performed by Firebase Authentication in the browser before the
// callable is reached, so it is covered by the manual checklist, not here.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const core = require("./adminAuthCore");

class FakeHttpsError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
core.setHttpsErrorForTesting(FakeHttpsError);

const SESSIONS = core.ADMIN_SESSION_COLLECTION;
const LIMITS = core.ADMIN_RATE_LIMIT_COLLECTION;
const NOW0 = Date.UTC(2026, 9, 29, 6, 0, 0);

class FakeDb {
  constructor() {
    this.docs = new Map();
    this.failWritesTo = null;
  }
  ref(collection, id) {
    const db = this;
    const key = `${collection}/${id}`;
    return {
      key,
      id,
      async get() {
        const value = db.docs.get(key);
        return { exists: value !== undefined, data: () => (value ? structuredClone(value) : undefined) };
      },
      async set(data) {
        if (db.failWritesTo === collection) throw new Error("firestore unavailable");
        db.docs.set(key, structuredClone(data));
      },
      async delete() {
        db.docs.delete(key);
      },
    };
  }
  collection(name) {
    return { doc: (id) => this.ref(name, id) };
  }
  async runTransaction(fn) {
    const writes = [];
    const tx = {
      get: (ref) => ref.get(),
      set: (ref, data) => writes.push([ref, data]),
    };
    const result = await fn(tx);
    for (const [ref, data] of writes) await ref.set(data);
    return result;
  }
  keys(collection) {
    return [...this.docs.keys()].filter((k) => k.startsWith(collection + "/"));
  }
}

const OWNER_UID = "owner-uid-1";

function ownerRecord(overrides = {}) {
  return {
    uid: OWNER_UID,
    email: "jaganmakes@gmail.com",
    emailVerified: true,
    disabled: false,
    providerData: [{ providerId: "password" }],
    tokensValidAfterTime: new Date(NOW0 - 24 * 3600 * 1000).toUTCString(),
    ...overrides,
  };
}

function authContext({
  uid = OWNER_UID,
  email = "jaganmakes@gmail.com",
  verified = true,
  provider = "password",
  authTimeMs = NOW0 - 30 * 1000,
} = {}) {
  return {
    uid,
    token: {
      email,
      email_verified: verified,
      auth_time: Math.floor(authTimeMs / 1000),
      firebase: { sign_in_provider: provider },
    },
  };
}

function setup({ record = ownerRecord(), records } = {}) {
  const clock = { now: NOW0 };
  const db = new FakeDb();
  const logs = [];
  const users = records || { [OWNER_UID]: record };
  const auth = {
    async getUser(uid) {
      if (auth.failWith) throw auth.failWith;
      if (!users[uid]) {
        const e = new Error("no user");
        e.code = "auth/user-not-found";
        throw e;
      }
      return users[uid];
    },
    async revokeRefreshTokens(uid) {
      auth.revokedUid = uid;
      if (users[uid]) users[uid] = { ...users[uid], tokensValidAfterTime: new Date(clock.now).toUTCString() };
    },
  };
  const admin = core.createAdminAuth({
    db,
    auth,
    FieldValue: { serverTimestamp: () => ({ __serverTimestamp: true }) },
    now: () => clock.now,
    logger: { error: (...args) => logs.push(args) },
  });
  return { admin, db, auth, clock, logs, users };
}

const req = (auth, data = {}, ip = "203.0.113.7") => ({ auth, data, rawRequest: { ip } });

async function rejects(promise, code, reason) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.code, code, `expected ${code}, got ${error.code}: ${error.message}`);
    if (reason !== undefined) assert.equal(error.details && error.details.reason, reason);
    return true;
  });
}

// ---------------------------------------------------------------- login ---

test("authorized owner (verified, password provider) receives a session", async () => {
  const { admin, db } = setup();
  const result = await admin.login(req(authContext()));

  assert.ok(result.sessionToken.length >= 40);
  assert.equal(new Date(result.expiresAt).getTime(), NOW0 + 8 * 3600 * 1000);

  const keys = db.keys(SESSIONS);
  assert.equal(keys.length, 1);
  const expectedHash = crypto.createHash("sha256").update(result.sessionToken).digest("hex");
  assert.equal(keys[0], `${SESSIONS}/${expectedHash}`, "doc id is the SHA-256 of the token");

  const stored = db.docs.get(keys[0]);
  assert.equal(stored.uid, OWNER_UID);
  assert.equal(stored.provider, "password");
  const serialized = JSON.stringify([...db.docs.entries()]);
  assert.ok(!serialized.includes(result.sessionToken), "raw session token is never stored");
});

test("email comparison is trimmed and case-insensitive, but exact otherwise", async () => {
  const ok = setup({ record: ownerRecord({ email: "JaganMakes@Gmail.com" }) });
  await ok.admin.login(req(authContext({ email: "  JaganMakes@Gmail.com " })));

  for (const email of ["jagan.makes@gmail.com", "jaganmakes+x@gmail.com", "jaganmakes@gmail.com.evil.com", "", null]) {
    const { admin, db } = setup();
    await rejects(admin.login(req(authContext({ email }))), "permission-denied");
    assert.equal(db.keys(SESSIONS).length, 0);
  }
});

test("unauthorized email with a valid password gets no session", async () => {
  const { admin, db } = setup({
    records: { other: ownerRecord({ uid: "other", email: "someone@example.com" }) },
  });
  await rejects(admin.login(req(authContext({ uid: "other", email: "someone@example.com" }))), "permission-denied", undefined);
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("calling the backend directly without authentication is rejected", async () => {
  const { admin, db } = setup();
  await rejects(admin.login(req(null)), "unauthenticated");
  await rejects(admin.login(req(undefined)), "unauthenticated");
  await rejects(admin.login(req({ uid: "", token: {} })), "unauthenticated");
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("client-supplied email/uid/isAdmin fields are ignored", async () => {
  const { admin, db } = setup({ records: { other: ownerRecord({ uid: "other", email: "someone@example.com" }) } });
  const forged = req(authContext({ uid: "other", email: "someone@example.com" }), {
    email: "jaganmakes@gmail.com",
    uid: OWNER_UID,
    isAdmin: true,
    role: "admin",
  });
  await rejects(admin.login(forged), "permission-denied");
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("owner email with an unverified address is denied (token claim)", async () => {
  const { admin, db } = setup();
  await rejects(admin.login(req(authContext({ verified: false }))), "permission-denied", "email-not-verified");
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("owner email unverified on the live record is denied even if the token claims verified", async () => {
  const { admin, db } = setup({ record: ownerRecord({ emailVerified: false }) });
  await rejects(admin.login(req(authContext())), "permission-denied", "email-not-verified");
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("Google (or any non-password) sign-in cannot create an admin session", async () => {
  for (const provider of ["google.com", "custom", "anonymous", null]) {
    const { admin, db } = setup();
    await rejects(admin.login(req(authContext({ provider }))), "permission-denied");
    assert.equal(db.keys(SESSIONS).length, 0);
  }
});

test("account without a password provider on the live record is denied", async () => {
  const { admin } = setup({ record: ownerRecord({ providerData: [{ providerId: "google.com" }] }) });
  await rejects(admin.login(req(authContext())), "permission-denied");
});

test("disabled account is denied", async () => {
  const { admin, db } = setup({ record: ownerRecord({ disabled: true }) });
  await rejects(admin.login(req(authContext())), "permission-denied");
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("deleted account is denied", async () => {
  const { admin } = setup({ records: {} });
  await rejects(admin.login(req(authContext())), "permission-denied");
});

test("ID token issued before tokens were revoked is rejected", async () => {
  const { admin } = setup({ record: ownerRecord({ tokensValidAfterTime: new Date(NOW0 - 10 * 1000).toUTCString() }) });
  await rejects(admin.login(req(authContext({ authTimeMs: NOW0 - 60 * 1000 }))), "unauthenticated");
});

test("login requires a recent sign-in, verify does not", async () => {
  const stale = authContext({ authTimeMs: NOW0 - 6 * 60 * 1000 });
  const { admin } = setup();
  await rejects(admin.login(req(stale)), "unauthenticated", "reauth-required");

  const fresh = await admin.login(req(authContext()));
  const verified = await admin.verify(req(stale, { sessionToken: fresh.sessionToken }));
  assert.deepEqual(verified, { valid: true });
});

// -------------------------------------------------------------- sessions ---

test("verify accepts a live session and rejects unknown, malformed and foreign ones", async () => {
  const { admin } = setup({
    records: { [OWNER_UID]: ownerRecord() },
  });
  const { sessionToken } = await admin.login(req(authContext()));

  assert.deepEqual(await admin.verify(req(authContext(), { sessionToken })), { valid: true });

  await rejects(admin.verify(req(authContext(), { sessionToken: "x".repeat(60) })), "unauthenticated");
  await rejects(admin.verify(req(authContext(), { sessionToken: "short" })), "unauthenticated");
  await rejects(admin.verify(req(authContext(), {})), "unauthenticated");
  await rejects(admin.verify(req(null, { sessionToken })), "unauthenticated");
});

test("an expired session is rejected and removed", async () => {
  const { admin, db, clock } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  clock.now += 8 * 3600 * 1000 + 1;
  await rejects(admin.verify(req(authContext({ authTimeMs: clock.now - 1000 }), { sessionToken })), "unauthenticated");
  assert.equal(db.keys(SESSIONS).length, 0);
});

test("a session just inside the eight-hour lifetime is still valid", async () => {
  const { admin, clock } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  clock.now += 8 * 3600 * 1000 - 1000;
  assert.deepEqual(await admin.verify(req(authContext(), { sessionToken })), { valid: true });
});

test("a session bound to a different UID is rejected", async () => {
  const { admin, db } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  const key = db.keys(SESSIONS)[0];
  db.docs.set(key, { ...db.docs.get(key), uid: "someone-else" });
  await rejects(admin.verify(req(authContext(), { sessionToken })), "unauthenticated");
});

test("a legacy Google-provider session record is rejected", async () => {
  const { admin, db } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  const key = db.keys(SESSIONS)[0];
  db.docs.set(key, { ...db.docs.get(key), provider: "google.com" });
  await rejects(admin.verify(req(authContext(), { sessionToken })), "unauthenticated");
});

test("a session stops working when the account is disabled afterwards", async () => {
  const { admin, users } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  users[OWNER_UID] = ownerRecord({ disabled: true });
  await rejects(admin.verify(req(authContext(), { sessionToken })), "permission-denied");
});

test("requireAdminSession (gate for future admin operations) enforces identity and session", async () => {
  const { admin } = setup();
  const { sessionToken } = await admin.login(req(authContext()));

  const ok = await admin.requireAdminSession(req(authContext(), { sessionToken }));
  assert.equal(ok.uid, OWNER_UID);

  await rejects(admin.requireAdminSession(req(authContext(), {})), "unauthenticated");
  await rejects(admin.requireAdminSession(req(authContext({ provider: "google.com" }), { sessionToken })), "permission-denied");
});

// ---------------------------------------------------------------- logout ---

test("logout revokes the server-side session", async () => {
  const { admin, db } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  assert.equal(db.keys(SESSIONS).length, 1);

  assert.deepEqual(await admin.logout(req(authContext(), { sessionToken })), { success: true });
  assert.equal(db.keys(SESSIONS).length, 0);
  await rejects(admin.verify(req(authContext(), { sessionToken })), "unauthenticated");
});

test("logout cannot revoke another user's session and requires owner identity", async () => {
  const { admin, db } = setup();
  const { sessionToken } = await admin.login(req(authContext()));
  await rejects(admin.logout(req(authContext({ email: "x@example.com" }), { sessionToken })), "permission-denied");
  await rejects(admin.logout(req(null, { sessionToken })), "unauthenticated");
  assert.equal(db.keys(SESSIONS).length, 1);
});

test("logout without a legacy session revokes Firebase refresh tokens", async () => {
  const { admin, auth } = setup();
  assert.deepEqual(await admin.logout(req(authContext())), { success: true });
  assert.equal(auth.revokedUid, OWNER_UID);
  await rejects(admin.assertOwnerIdentity(authContext()), "unauthenticated");
});

// ---------------------------------------------------------- rate limiting ---

test("repeated attempts from one source are throttled, then recover after 15 minutes", async () => {
  const { admin, clock } = setup();
  const bad = () => req(authContext({ email: "x@example.com", uid: "x" }), {}, "198.51.100.9");

  for (let i = 0; i < core.ADMIN_MAX_ATTEMPTS_PER_WINDOW; i++) {
    await rejects(admin.login(bad()), "permission-denied");
  }
  await rejects(admin.login(bad()), "resource-exhausted");

  // Even the genuine owner is paused from the abusive source while it is locked...
  await rejects(admin.login(req(authContext(), {}, "198.51.100.9")), "resource-exhausted");
  // ...but another source is unaffected, and the lock is temporary.
  await admin.login(req(authContext(), {}, "192.0.2.50"));

  clock.now += core.ADMIN_RATE_WINDOW_MS + 1000;
  const result = await admin.login(req(authContext({ authTimeMs: clock.now - 1000 }), {}, "198.51.100.9"));
  assert.ok(result.sessionToken);
});

test("unauthenticated flooding cannot lock out an authenticated owner on another source", async () => {
  const { admin } = setup();
  for (let i = 0; i < 12; i++) {
    await admin.login(req(null, {}, "198.51.100.66")).catch(() => {});
  }
  const result = await admin.login(req(authContext(), {}, "192.0.2.77"));
  assert.ok(result.sessionToken);
});

test("a student-style account is throttled per UID even when rotating source IPs", async () => {
  const { admin } = setup({ records: { stu: ownerRecord({ uid: "stu", email: "student@example.com" }) } });
  const student = authContext({ uid: "stu", email: "student@example.com", provider: "google.com" });
  for (let i = 0; i < core.ADMIN_MAX_ATTEMPTS_PER_WINDOW; i++) {
    await rejects(admin.login(req(student, {}, `203.0.113.${i + 1}`)), "permission-denied");
  }
  await rejects(admin.login(req(student, {}, "203.0.113.200")), "resource-exhausted");
});

test("a successful login clears the throttling counters", async () => {
  const { admin, db } = setup();
  for (let i = 0; i < 3; i++) await admin.login(req(authContext({ email: "x@example.com" }))).catch(() => {});
  assert.ok(db.keys(LIMITS).length > 0);
  await admin.login(req(authContext()));
  assert.equal(db.keys(LIMITS).length, 0);
});

// --------------------------------------------------------- error handling ---

test("unexpected backend failures are masked and logged without secrets", async () => {
  const { admin, auth, logs } = setup();
  auth.failWith = new Error("identity toolkit exploded");
  const idTokenLike = "eyJhbGciOiJSUzI1NiJ9.SECRET-ID-TOKEN";
  const ctx = authContext();
  ctx.token.rawIdToken = idTokenLike;

  await assert.rejects(admin.login(req(ctx, { password: "hunter2" })), (error) => {
    assert.equal(error.code, "internal");
    assert.equal(error.message, "Admin sign-in could not be completed. Please try again.");
    assert.ok(!error.message.includes("exploded"));
    return true;
  });

  const logged = JSON.stringify(logs);
  assert.ok(logs.length === 1 && logged.includes("owner-identity"));
  assert.ok(!logged.includes("hunter2"), "password never logged");
  assert.ok(!logged.includes("SECRET-ID-TOKEN"), "ID token never logged");
});+
test("session-write failure after authorization is masked and no token leaks into logs", async () => {
  const { admin, db, logs } = setup();
  db.failWritesTo = SESSIONS;
  await assert.rejects(admin.login(req(authContext())), (error) => error.code === "internal");
  assert.ok(logs.length === 1);
  assert.ok(JSON.stringify(logs).includes("create-session"));
  assert.equal(db.keys(SESSIONS).length, 0);
});
