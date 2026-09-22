import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CampusNotification {
  id: string;
  recipientEmail: string;       // Email of the student who posted the question
  senderName: string;           // Name of the user who answered
  questionId: string;           // ID of the post
  questionTitle: string;        // Title of the question
  replySnippet: string;         // First 80 chars of the answer
  createdAt: any;               // Firestore serverTimestamp
  isRead: boolean;
}

/**
 * Trigger Resend email alert using Bearer token via backend route with client fallback
 */
export async function triggerResendEmailAlert(params: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  questionTitle: string;
  answerText: string;
}): Promise<{ success: boolean; result?: any }> {
  if (!params.recipientEmail || !params.recipientEmail.includes('@')) {
    return { success: false, result: 'No valid recipient email' };
  }

  try {
    const res = await fetch('/api/send-reply-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: params.recipientEmail,
        recipientName: params.recipientName,
        questionTitle: params.questionTitle,
        replyAuthor: params.senderName,
        replyContent: params.answerText,
      }),
    });

    let data = null;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) {
      return { success: false, result: data?.error || `Email endpoint returned ${res.status}` };
    }
    return { success: data?.success !== false, result: data };
  } catch (err: any) {
    console.warn('[CampusConnect] Secure email endpoint note:', err?.message || err);
    return { success: false, result: err?.message || 'Email delivery unavailable' };
  }
}

/**
 * Dispatch both In-App Firestore notification and Resend Email
 */
export async function dispatchAnswerNotificationFlow(params: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  questionId: string;
  questionTitle: string;
  answerText: string;
  emailNotificationsEnabled?: boolean;
}): Promise<void> {
  if (!params.recipientEmail || !params.recipientEmail.includes('@')) {
    return;
  }

  const shouldSendEmail = params.emailNotificationsEnabled === true;

  // a. Create Firestore Notification
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientEmail: params.recipientEmail,
      senderName: params.senderName || 'A Fellow Student',
      questionId: params.questionId,
      questionTitle: params.questionTitle,
      replySnippet: params.answerText.slice(0, 80) + '...',
      createdAt: serverTimestamp(),
      isRead: false,
    });
  } catch (notifErr: any) {
    console.warn('[CampusConnect] In-app notification creation note:', notifErr?.message || notifErr);
  }

  // b. Trigger Resend Email Alert only when the question owner explicitly has email notifications enabled.
  if (!shouldSendEmail) return;

  try {
    await triggerResendEmailAlert({
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      senderName: params.senderName,
      questionTitle: params.questionTitle,
      answerText: params.answerText,
    });
  } catch (emailErr: any) {
    console.warn('[CampusConnect] Resend email dispatch note:', emailErr?.message || emailErr);
  }
}
