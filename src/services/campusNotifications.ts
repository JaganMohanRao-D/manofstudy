import {
  collection,
  addDoc,
  serverTimestamp,
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
 * Create the in-app answer notification.
 * Email delivery is handled server-side by the Firestore trigger so a reply
 * cannot accidentally generate two emails.
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

  // Email delivery is intentionally not performed from the browser.
  // The Firestore-triggered backend function owns email delivery and checks
  // the user's stored preference before creating a mail document.
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientEmail: params.recipientEmail,
      senderName: params.senderName || 'A Fellow Student',
      questionId: params.questionId,
      questionTitle: params.questionTitle,
      replySnippet: String(params.answerText || '').slice(0, 80),
      createdAt: serverTimestamp(),
      isRead: false,
    });
  } catch (err: any) {
    console.warn('[CampusConnect] In-app notification creation note:', err?.message || err);
  }
}
