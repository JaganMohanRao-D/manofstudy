import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CampusNotification {
  id: string;
  recipientEmail?: string;      // Email of the student who posted the question
  recipientUid?: string;        // UID of the student who posted the question
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
 * cannot accidentally leak private email addresses or generate spam.
 */
export async function dispatchAnswerNotificationFlow(params: {
  recipientEmail?: string;
  recipientUid?: string;
  recipientName?: string;
  senderName: string;
  questionId: string;
  questionTitle: string;
  answerText: string;
  emailNotificationsEnabled?: boolean;
}): Promise<void> {
  if (!params.recipientEmail && !params.recipientUid) {
    return;
  }

  try {
    const payload: Record<string, any> = {
      senderName: params.senderName || 'A Fellow Student',
      questionId: params.questionId,
      questionTitle: params.questionTitle,
      replySnippet: String(params.answerText || '').slice(0, 80),
      createdAt: serverTimestamp(),
      isRead: false,
    };

    if (params.recipientUid) {
      payload.recipientUid = params.recipientUid;
    }
    if (params.recipientEmail) {
      payload.recipientEmail = params.recipientEmail;
    }

    await addDoc(collection(db, 'notifications'), payload);
  } catch (err: any) {
    console.debug('[CampusConnect] In-app notification creation note:', err?.message || err);
  }
}
