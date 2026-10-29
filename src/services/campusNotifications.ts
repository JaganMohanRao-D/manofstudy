import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface CampusNotification {
  id: string;
  recipientUid: string;
  senderUid: string;
  senderName: string;
  questionId: string;
  questionTitle: string;
  replySnippet: string;
  createdAt: any;
  isRead: boolean;
}

/**
 * Create an in-app answer notification.
 *
 * Security is enforced again in Firestore rules: the authenticated sender must
 * be the senderUid, and recipientUid must be the author of questionId. Email
 * addresses are deliberately excluded from this client-created document.
 * Transactional email delivery remains server-side in the Firebase trigger.
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
  const currentUser = auth.currentUser;
  if (!currentUser || !params.recipientUid || !params.questionId) {
    return;
  }

  if (currentUser.uid === params.recipientUid) {
    return;
  }

  try {
    const payload = {
      senderUid: currentUser.uid,
      recipientUid: params.recipientUid,
      senderName: String(params.senderName || 'A Fellow Student').slice(0, 120),
      questionId: params.questionId,
      questionTitle: String(params.questionTitle || 'Your Question').slice(0, 300),
      replySnippet: String(params.answerText || '').slice(0, 500),
      createdAt: serverTimestamp(),
      isRead: false,
    } satisfies Record<string, unknown>;

    await addDoc(collection(db, 'notifications'), payload);
  } catch (err: any) {
    console.debug('[CampusConnect] In-app notification creation note:', err?.message || err);
  }
}
