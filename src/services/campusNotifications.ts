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

  const subject = `[MAN OF STUDY] Someone replied to your question: "${params.questionTitle.slice(0, 40)}..."`;
  const html = `<h3>Hello ${params.recipientName || 'Student'},</h3><p><b>${params.senderName || 'A Fellow Student'}</b> just shared an insight on your question: <i>"${params.questionTitle}"</i></p><p style="padding:12px;background:#FFF0F5;border-left:4px solid #EC4899;">"${params.answerText.slice(0, 150)}..."</p><p><a href="https://manofstudy.pages.dev/#campus-connect" style="background:#EC4899;color:white;padding:8px 16px;text-decoration:none;border-radius:8px;">View Reply on MOS CampusConnect</a></p>`;

  // 1. Try serverless backend route first to prevent browser CORS blocks
  try {
    const res = await fetch('/api/campus/send-resend-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.recipientEmail,
        subject,
        html,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, result: data };
    }
  } catch (err) {
    console.debug('[Resend] Backend endpoint note, falling back to direct fetch:', err);
  }

  // 2. Direct client fetch fallback using Bearer token
  try {
    const directRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_2ZBQ4b12_7vRxwSgcwkKrFm2BnnbCyF6y',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [params.recipientEmail],
        subject,
        html,
      }),
    });
    const data = await directRes.json();
    return { success: true, result: data };
  } catch (directErr: any) {
    console.warn('[Resend] Direct email delivery notice:', directErr?.message || directErr);
    return { success: false, result: directErr?.message };
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
}): Promise<void> {
  if (!params.recipientEmail || !params.recipientEmail.includes('@')) {
    return;
  }

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

  // b. Trigger Resend Email Alert
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
