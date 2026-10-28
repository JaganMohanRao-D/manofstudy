const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

/**
 * Production 2nd Gen Cloud Function:
 * Automatically triggered when a new answer is created in Firestore.
 * Document path: campus_posts/{postId}/replies/{replyId}
 */
exports.notifyQuestionOwnerOnAnswer = onDocumentCreated(
  {
    document: "campus_posts/{postId}/replies/{replyId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const replySnapshot = event.data;
    if (!replySnapshot) {
      console.log("[NotifyTrigger] No snapshot data available.");
      return null;
    }

    const replyData = replySnapshot.data();
    const { postId, replyId } = event.params;

    // Keep the public parent feed synchronized from the authoritative reply
    // subcollection. Admin SDK bypasses client rules, so clients cannot spoof
    // another user's replies by editing the parent array directly.
    const questionRef = db.collection("campus_posts").doc(postId);
    await questionRef.set(
      {
        replies: FieldValue.arrayUnion(replyData),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const answerAuthorUid = replyData.authorUid;
    const isAnonymous = Boolean(replyData.isAnonymous);
    const replyAuthorName = isAnonymous
      ? "A fellow student"
      : (replyData.authorName || replyData.displayName || "A fellow student");

    console.log(`[NotifyTrigger] New answer received: ${replyId} on post: ${postId}`);

    // 1. Fetch parent question
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      console.warn(`[NotifyTrigger] Parent question ${postId} does not exist in Firestore.`);
      return null;
    }

    const questionData = questionDoc.data();
    const questionAuthorUid = questionData.authorUid;
    const questionTitle = questionData.title || "Your Question";

    // 2. Avoid self-notifications (Requirement 6)
    if (answerAuthorUid && questionAuthorUid && answerAuthorUid === questionAuthorUid) {
      console.log(`[NotifyTrigger] Self-answer detected (author ${questionAuthorUid} answered own doubt). Skipping notification.`);
      return null;
    }

    // 3. Duplicate email protection via deterministic notification ID (Requirement 10)
    const notificationId = `answer_notification_${postId}_${replyId}`;
    const mailDocRef = db.collection("mail").doc(notificationId);
    const existingMailDoc = await mailDocRef.get();

    if (existingMailDoc.exists) {
      console.log(`[NotifyTrigger] Duplicate protection: Notification ${notificationId} has already been created. Skipping.`);
      return null;
    }

    // 4. Retrieve question owner profile and email notification preference (Requirements 2 & 9)
    let questionOwnerEmail = null;
    let questionOwnerName = "Student";
    let emailNotificationsEnabled = true;

    try {
      const userDoc = await db.collection("users").doc(questionAuthorUid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        questionOwnerEmail = userData.email;
        questionOwnerName = userData.displayName || "Student";
        if (userData.emailNotificationsEnabled === false) {
          emailNotificationsEnabled = false;
        }
      }
    } catch (err) {
      console.warn(`[NotifyTrigger] Could not query user profile:`, err.message);
    }

    // Fallback: Query Firebase Auth user record for verified Google email
    if (!questionOwnerEmail) {
      try {
        const authUser = await getAuth().getUser(questionAuthorUid);
        questionOwnerEmail = authUser.email;
        if (!questionOwnerName && authUser.displayName) {
          questionOwnerName = authUser.displayName;
        }
      } catch (authErr) {
        console.error(`[NotifyTrigger] Failed to resolve auth user record for UID ${questionAuthorUid}:`, authErr.message);
      }
    }

    // 5. Verify notification preference
    if (!emailNotificationsEnabled) {
      console.log(`[NotifyTrigger] User ${questionAuthorUid} has disabled email notifications. Skipping.`);
      return null;
    }

    if (!questionOwnerEmail || !questionOwnerEmail.includes("@")) {
      console.warn(`[NotifyTrigger] No verified recipient email found for user ${questionAuthorUid}. Aborting.`);
      return null;
    }

    // 6. Build clean, privacy-preserving email HTML (Requirement 8)
    const viewAnswerUrl = `https://naacollege.in/#campus-connect`;
    const safeTitle = String(questionTitle).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeRecipientName = String(questionOwnerName).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeAnswerAuthor = String(replyAuthorName).replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const emailSubject = "Someone answered your question on Naa College CampusConnect";
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fffafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fce7f3; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.06);">
    <!-- Brand Header -->
    <div style="background-color: #be185d; padding: 20px 24px; text-align: left;">
      <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">
        NAA COLLEGE <span style="font-weight: 400; font-size: 14px; opacity: 0.9;">| CampusConnect</span>
      </h1>
    </div>

    <!-- Body Content -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hi ${safeRecipientName},</p>
      
      <p style="font-size: 15px; line-height: 1.6;">Someone has answered your question on Naa College CampusConnect.</p>

      <div style="margin: 20px 0; padding: 14px 18px; background-color: #fdf2f8; border-left: 4px solid #ec4899; border-radius: 6px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #9d174d; text-transform: uppercase; letter-spacing: 0.05em;">Your question:</p>
        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.5;">"${safeTitle}"</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        A student has posted an answer to your question.
      </p>

      <!-- View Answer CTA Button (Requirement 8) -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${viewAnswerUrl}" style="display: inline-block; background-color: #be185d; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 6px rgba(190, 24, 93, 0.3);">
          View Answer
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />

      <!-- Footer (Requirement 8) -->
      <div style="text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0; font-weight: 600; color: #334155;">Naa College</p>
        <p style="margin: 2px 0 12px 0; color: #ec4899; font-style: italic;">Built for students. Built by a student.</p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          You received this email because you opted in for answer notifications on Naa College CampusConnect.<br/>
          Your email address is not included in the public question or answer.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // 7. Write to mail collection for Firebase Trigger Email extension (Requirement 7)
    await mailDocRef.set({
      to: [questionOwnerEmail],
      toUids: [questionAuthorUid],
      message: {
        subject: emailSubject,
        html: emailHtml,
      },
      template: {
        name: "campusconnect-answer",
        data: {
          displayName: safeRecipientName,
          questionTitle: safeTitle,
          questionId: postId,
          answerId: replyId,
          replyAuthor: safeAnswerAuthor,
        },
      },
      postId: postId,
      replyId: replyId,
      createdAt: FieldValue.serverTimestamp(),
      delivery: {
        state: "PENDING",
      },
    });

    console.log(`[NotifyTrigger] Successfully queued mail document ${notificationId} for ${questionOwnerEmail}`);
    return { success: true, notificationId };
  }
);


/**
 * Maintain aggregate post upvote count from per-user vote documents.
 */
exports.syncCampusPostUpvote = onDocumentCreated(
  {
    document: "campus_posts/{postId}/upvotes/{userId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const { postId } = event.params;
    await db.collection("campus_posts").doc(postId).set(
      { upvotes: FieldValue.increment(1) },
      { merge: true }
    );
  }
);

exports.removeCampusPostUpvote = onDocumentDeleted(
  {
    document: "campus_posts/{postId}/upvotes/{userId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const { postId } = event.params;
    await db.collection("campus_posts").doc(postId).set(
      { upvotes: FieldValue.increment(-1) },
      { merge: true }
    );
  }
);

/**
 * Maintain aggregate reply upvote count inside the parent feed.
 * The parent replies array is updated server-side so clients cannot rewrite
 * another student's answer while voting.
 */
async function syncCampusReplyUpvote(event, delta) {
  const { postId, replyId } = event.params;
  const postRef = db.collection("campus_posts").doc(postId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(postRef);
    if (!snap.exists) return;
    const data = snap.data() || {};
    const replies = Array.isArray(data.replies) ? data.replies : [];
    const nextReplies = replies.map((reply) => {
      if (!reply || reply.id !== replyId) return reply;
      const current = Number.isFinite(reply.upvotes) ? reply.upvotes : 0;
      return { ...reply, upvotes: Math.max(0, current + delta) };
    });
    tx.update(postRef, { replies: nextReplies, updatedAt: FieldValue.serverTimestamp() });
  });
}

exports.syncCampusReplyUpvote = onDocumentCreated(
  {
    document: "campus_posts/{postId}/replies/{replyId}/upvotes/{userId}",
    region: "asia-southeast1",
  },
  (event) => syncCampusReplyUpvote(event, 1)
);

exports.removeCampusReplyUpvote = onDocumentDeleted(
  {
    document: "campus_posts/{postId}/replies/{replyId}/upvotes/{userId}",
    region: "asia-southeast1",
  },
  (event) => syncCampusReplyUpvote(event, -1)
);


/**
 * Trusted community moderation pipeline.
 * A client can create a report, but only this backend function can change
 * moderation counters, hide content, or suspend an account.
 */
exports.processCampusCommunityReport = onDocumentCreated(
  {
    document: "reports/{reportId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const report = event.data?.data();
    if (!report) return null;

    const { targetType, targetId, postId, authorUid } = report;
    const reporterUid = report.reporterUid;
    const { reportId } = event.params;
    if (!reporterUid || !targetType || !targetId || !postId) return null;

    // Only process the canonical one-report-per-user-and-target document ID.
    // This also protects moderation from forged legacy client writes.
    const expectedReportId = `rep_${targetType}_${postId}_${targetId}_${reporterUid}`;
    if (reportId !== expectedReportId) {
      console.warn(`[CommunityReport] Ignoring non-canonical report ID ${reportId}.`);
      return null;
    }

    const targetRef = targetType === "post"
      ? db.collection("campus_posts").doc(targetId)
      : db.collection("campus_posts").doc(postId).collection("replies").doc(targetId);

    const result = await db.runTransaction(async (tx) => {
      const targetSnap = await tx.get(targetRef);
      if (!targetSnap.exists) return { isHidden: false, authorUid: authorUid || null, reportCount: 0 };

      const current = targetSnap.data() || {};
      const reportCount = Math.max(0, Number(current.reportCount) || 0) + 1;
      const isHidden = reportCount >= 3;
      tx.update(targetRef, {
        reportCount,
        ...(isHidden ? { isHidden: true } : {}),
      });

      return {
        isHidden,
        authorUid: current.authorUid || null,
        reportCount,
      };
    });

    // Keep the parent feed's embedded reply in sync when a reply is moderated.
    if (targetType === "reply") {
      const parentRef = db.collection("campus_posts").doc(postId);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(parentRef);
        if (!snap.exists) return;
        const data = snap.data() || {};
        const replies = Array.isArray(data.replies) ? data.replies : [];
        const nextReplies = replies.map((reply) =>
          reply && reply.id === targetId
            ? {
                ...reply,
                reportCount: result.reportCount,
                ...(result.isHidden ? { isHidden: true } : {}),
              }
            : reply
        );
        tx.update(parentRef, {
          replies: nextReplies,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    }

    if (result.authorUid) {
      const authorRef = db.collection("users").doc(result.authorUid);
      const authorSnap = await authorRef.get();
      const existingReports = authorSnap.exists()
        ? (Number(authorSnap.data().totalReports) || 0)
        : 0;
      const totalReports = existingReports + 1;
      await authorRef.set(
        {
          totalReports,
          ...(totalReports >= 5
            ? {
                isBanned: true,
                bannedAt: FieldValue.serverTimestamp(),
                bannedReason: "Account suspended due to repeated community reports",
              }
            : {}),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return {
      success: true,
      isHidden: result.isHidden,
      reportCount: result.reportCount,
    };
  }
);

// Public, rate-limited website guide endpoint; Gemini credentials stay in Secret Manager.
exports.websiteAssistantChat = require("./websiteAssistant").websiteAssistantChat;


// ---------------------------------------------------------------------------
// Private Naa College owner portal authentication.
// Passwords are scrypt-hashed server-side; raw passwords and the one-time
// setup key are never written to Firestore, logs, or client bundles.
// ---------------------------------------------------------------------------
const crypto = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const ADMIN_SETUP_KEY = defineSecret("ADMIN_SETUP_KEY");
const ADMIN_OWNER_EMAIL = "jaganmakes@gmail.com";
const ADMIN_AUTH_REGION = "asia-southeast1";
const ADMIN_ALLOWED_ORIGINS = [
  "https://naacollege.in",
  "https://www.naacollege.in",
];
const ADMIN_CREDENTIALS_REF = () => db.collection("private_admin").doc("credentials");
const ADMIN_SESSION_COLLECTION = "private_admin_sessions";
const ADMIN_RATE_LIMIT_COLLECTION = "private_admin_rate_limits";
const ADMIN_SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const ADMIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_MAX_ATTEMPTS_PER_WINDOW = 8;

function adminCallableOptions(extraOptions = {}) {
  return {
    region: ADMIN_AUTH_REGION,
    cors: ADMIN_ALLOWED_ORIGINS,
    ...extraOptions,
  };
}

function constantTimeTextEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function adminPasswordInputIsValid(password) {
  return typeof password === "string" && password.length >= 12 && password.length <= 256;
}

function deriveAdminPasswordHash(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      return resolve(derivedKey.toString("hex"));
    });
  });
}

function getAdminRateLimitRef(request, purpose) {
  const rawIp = request && request.rawRequest && request.rawRequest.ip;
  const source = typeof rawIp === "string" && rawIp.length ? rawIp : "unknown";
  const identifier = crypto.createHash("sha256")
    .update(purpose + ":" + source)
    .digest("hex");
  return db.collection(ADMIN_RATE_LIMIT_COLLECTION).doc(identifier);
}

async function enforceAdminRateLimit(request, purpose) {
  const ref = getAdminRateLimitRef(request, purpose);
  const now = Date.now();
  const decision = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists ? snapshot.data() : {};
    if (Number(existing.lockedUntilMs) > now) {
      return { blocked: true };
    }

    let windowStartedAtMs = Number(existing.windowStartedAtMs) || now;
    let attempts = Number(existing.attempts) || 0;
    if (now - windowStartedAtMs >= ADMIN_RATE_WINDOW_MS) {
      windowStartedAtMs = now;
      attempts = 0;
    }

    if (attempts >= ADMIN_MAX_ATTEMPTS_PER_WINDOW) {
      transaction.set(ref, {
        attempts,
        windowStartedAtMs,
        lockedUntilMs: now + ADMIN_RATE_WINDOW_MS,
      });
      return { blocked: true };
    }

    transaction.set(ref, {
      attempts: attempts + 1,
      windowStartedAtMs,
      lockedUntilMs: 0,
      updatedAtMs: now,
    });
    return { blocked: false };
  });

  if (decision.blocked) {
    throw new HttpsError(
      "resource-exhausted",
      "Too many attempts. Please wait 15 minutes before trying again."
    );
  }
  return ref;
}

function hashAdminSessionToken(token) {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

async function getValidAdminSession(sessionToken) {
  if (typeof sessionToken !== "string" || sessionToken.length < 40 || sessionToken.length > 128) {
    return null;
  }
  const sessionRef = db.collection(ADMIN_SESSION_COLLECTION).doc(hashAdminSessionToken(sessionToken));
  const snapshot = await sessionRef.get();
  if (!snapshot.exists) return null;

  const session = snapshot.data() || {};
  if (Number(session.expiresAtMs) <= Date.now()) {
    await sessionRef.delete().catch(() => {});
    return null;
  }
  return { ref: sessionRef, email: ADMIN_OWNER_EMAIL };
}

exports.adminSetupStatus = onCall(
  adminCallableOptions(),
  async () => {
    const credentials = await ADMIN_CREDENTIALS_REF().get();
    return {
      needsSetup: !credentials.exists,
      ownerEmail: ADMIN_OWNER_EMAIL,
    };
  }
);

exports.initializeNaaAdmin = onCall(
  adminCallableOptions({ secrets: [ADMIN_SETUP_KEY], timeoutSeconds: 15 }),
  async (request) => {
    const credentialsRef = ADMIN_CREDENTIALS_REF();
    const alreadyInitialized = await credentialsRef.get();
    if (alreadyInitialized.exists) {
      throw new HttpsError("failed-precondition", "The one-time owner setup has already been completed.");
    }

    const email = typeof request.data?.email === "string"
      ? request.data.email.trim().toLowerCase()
      : "";
    const setupKey = typeof request.data?.setupKey === "string" ? request.data.setupKey : "";
    const password = request.data?.password;

    if (email !== ADMIN_OWNER_EMAIL) {
      throw new HttpsError("invalid-argument", "The owner email is fixed and cannot be changed.");
    }
    if (!adminPasswordInputIsValid(password)) {
      throw new HttpsError("invalid-argument", "Choose a password between 12 and 256 characters.");
    }
    if (!setupKey || setupKey.length > 512) {
      throw new HttpsError("permission-denied", "The one-time setup key is invalid.");
    }

    const rateLimitRef = await enforceAdminRateLimit(request, "setup");
    let configuredSetupKey = "";
    try {
      configuredSetupKey = ADMIN_SETUP_KEY.value();
    } catch (_) {
      throw new HttpsError(
        "failed-precondition",
        "Owner setup is not configured on the server yet. Contact the site administrator."
      );
    }

    if (typeof configuredSetupKey !== "string" || configuredSetupKey.length < 32) {
      throw new HttpsError(
        "failed-precondition",
        "Owner setup is not configured securely on the server yet."
      );
    }
    if (!constantTimeTextEqual(setupKey, configuredSetupKey)) {
      throw new HttpsError("permission-denied", "The one-time setup key is invalid.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await deriveAdminPasswordHash(password, salt);
    try {
      await db.runTransaction(async (transaction) => {
        const current = await transaction.get(credentialsRef);
        if (current.exists) {
          throw new HttpsError("failed-precondition", "The one-time owner setup has already been completed.");
        }
        transaction.create(credentialsRef, {
          email: ADMIN_OWNER_EMAIL,
          passwordSalt: salt,
          passwordHash,
          passwordAlgorithm: "scrypt-16384-64",
          createdAt: FieldValue.serverTimestamp(),
          credentialVersion: 1,
        });
      });
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("[AdminAuth] Owner setup failed due to a server-side error.");
      throw new HttpsError("internal", "Owner setup could not be completed. Please try again.");
    }

    await rateLimitRef.delete().catch(() => {});
    return { initialized: true };
  }
);

exports.loginNaaAdmin = onCall(
  adminCallableOptions({ timeoutSeconds: 15 }),
  async (request) => {
    const rateLimitRef = await enforceAdminRateLimit(request, "login");
    const identifier = typeof request.data?.identifier === "string"
      ? request.data.identifier.trim().toLowerCase()
      : "";
    const password = request.data?.password;

    const credentialsSnapshot = await ADMIN_CREDENTIALS_REF().get();
    if (!credentialsSnapshot.exists) {
      throw new HttpsError("failed-precondition", "Owner setup has not been completed yet.");
    }

    const credentials = credentialsSnapshot.data() || {};
    const identifierMatches = constantTimeTextEqual(identifier, ADMIN_OWNER_EMAIL);
    const passwordIsValidInput = typeof password === "string" && password.length <= 256;
    let passwordMatches = false;

    if (passwordIsValidInput && typeof credentials.passwordSalt === "string" &&
        typeof credentials.passwordHash === "string") {
      const derivedHash = await deriveAdminPasswordHash(password, credentials.passwordSalt);
      passwordMatches = constantTimeTextEqual(derivedHash, credentials.passwordHash);
    }

    if (!identifierMatches || !passwordMatches) {
      throw new HttpsError("unauthenticated", "Invalid username/email or password.");
    }

    const sessionToken = crypto.randomBytes(32).toString("base64url");
    const expiresAtMs = Date.now() + ADMIN_SESSION_LIFETIME_MS;
    await db.collection(ADMIN_SESSION_COLLECTION).doc(hashAdminSessionToken(sessionToken)).set({
      email: ADMIN_OWNER_EMAIL,
      createdAt: FieldValue.serverTimestamp(),
      expiresAtMs,
    });
    await rateLimitRef.delete().catch(() => {});

    return {
      sessionToken,
      expiresAt: new Date(expiresAtMs).toISOString(),
      ownerEmail: ADMIN_OWNER_EMAIL,
    };
  }
);

exports.verifyNaaAdminSession = onCall(
  adminCallableOptions(),
  async (request) => {
    const session = await getValidAdminSession(request.data?.sessionToken);
    if (!session) {
      throw new HttpsError("unauthenticated", "Your admin session has expired. Please sign in again.");
    }
    return { valid: true, ownerEmail: session.email };
  }
);

exports.logoutNaaAdmin = onCall(
  adminCallableOptions(),
  async (request) => {
    const token = request.data?.sessionToken;
    if (typeof token === "string" && token.length >= 40 && token.length <= 128) {
      await db.collection(ADMIN_SESSION_COLLECTION).doc(hashAdminSessionToken(token)).delete().catch(() => {});
    }
    return { success: true };
  }
);
