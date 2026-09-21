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
    const answerAuthorUid = replyData.authorUid;
    const isAnonymous = Boolean(replyData.isAnonymous);
    const replyAuthorName = isAnonymous
      ? "A fellow student"
      : (replyData.authorName || replyData.displayName || "A fellow student");

    console.log(`[NotifyTrigger] New answer received: ${replyId} on post: ${postId}`);

    // 1. Fetch parent question
    const questionRef = db.collection("campus_posts").doc(postId);
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
    const viewAnswerUrl = `https://manofstudy.vercel.app/#campus-connect`;
    const safeTitle = String(questionTitle).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeRecipientName = String(questionOwnerName).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeAnswerAuthor = String(replyAuthorName).replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const emailSubject = "Someone answered your question on MOS CampusConnect";
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
        MAN OF STUDY <span style="font-weight: 400; font-size: 14px; opacity: 0.9;">| CampusConnect</span>
      </h1>
    </div>

    <!-- Body Content -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">Hi ${safeRecipientName},</p>
      
      <p style="font-size: 15px; line-height: 1.6;">Someone has answered your question on Man of Study CampusConnect.</p>

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
        <p style="margin: 0; font-weight: 600; color: #334155;">Man of Study</p>
        <p style="margin: 2px 0 12px 0; color: #ec4899; font-style: italic;">Built for students. Built by a student.</p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          You received this email because you opted in for answer notifications on Man of Study CampusConnect.<br/>
          Your email address is 100% private and never visible to other students.
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
