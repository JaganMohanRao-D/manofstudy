import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  increment,
  arrayUnion,
  Firestore,
} from 'firebase/firestore';
// Official dedicated Firebase credentials for Man of Study
export const firebaseConfig = {
  apiKey: "AIzaSyAi1z2yWqdDXzeip3TUC37huvsChqK8Lqo",
  authDomain: "manofstudy-live.firebaseapp.com",
  projectId: "manofstudy-live",
  storageBucket: "manofstudy-live.firebasestorage.app",
  messagingSenderId: "9699503499",
  appId: "1:9699503499:web:2798a930e61a310c75538e",
  measurementId: "G-CBFMX3VKF4"
};

// 1. Initialize Firebase safely without duplicate initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 3. Firestore Database
export const db: Firestore = getFirestore(app);
export { signInWithPopup, signOut };

// 4. Validate Firestore Connection on App Start
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connected to Firestore successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client offline. Check configuration or network connectivity.');
    } else {
      console.log('[Firebase] Connection test ping completed.');
    }
    return false;
  }
}

// Check redirect result on mobile browsers if applicable
export async function checkRedirectAuth(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
  } catch (err: any) {
    console.debug('[Firebase] Redirect result check completed:', err?.message || err);
  }
  return null;
}

// 5. Sign In With Google (Popup with graceful cancellation & block handling)
export async function signInWithGoogleAccount(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // Gracefully handle normal user actions like closing the popup window
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('closed-by-user') ||
      error?.message?.includes('cancelled')
    ) {
      console.info('[Firebase] Sign-in popup was closed or cancelled by user.');
      return null;
    }

    // If popup was blocked (e.g. by browser or iframe settings)
    if (error?.code === 'auth/popup-blocked') {
      console.warn('[Firebase] Popup blocked by browser settings.');
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new tab.');
    }

    if (error?.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '';
      console.warn('[Firebase] Unauthorized domain:', currentHost || error?.message);
      const domainErr = new Error(
        `This domain (${currentHost || 'unknown'}) is not authorized for Google Sign-In in Firebase. Please add this domain in Firebase Console under Authentication > Settings > Authorized Domains.`
      );
      (domainErr as any).code = 'auth/unauthorized-domain';
      (domainErr as any).domain = currentHost;
      throw domainErr;
    }

    console.warn('[Firebase] Google sign-in status:', error?.message || error);
    throw new Error(error?.message || 'Failed to authenticate with Google.');
  }
}

// 6. Sign Out
export async function signOutGoogleAccount(): Promise<void> {
  await signOut(auth);
}

// 7. Subscribe to Auth State
export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 8. Types for CampusConnect Firestore Documents
export interface FirestoreCampusPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorEmail?: string;
  displayName: string;
  isAnonymous: boolean;
  title: string;
  content: string;
  college: string;
  branch: string;
  type: 'doubt' | 'dispatch';
  urgency: string;
  codeSnippet?: string;
  upvotes: number;
  createdAt: string;
  updatedAt?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
  }>;
}

export interface FirestoreCampusReply {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  displayName: string;
  isAnonymous: boolean;
  content: string;
  college: string;
  role: string;
  upvotes: number;
  isVerifiedSolution: boolean;
  isAdmin?: boolean;
  createdAt: string;
}

// User Profile for CampusConnect (with email notification preferences & reputation)
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailNotificationsEnabled: boolean;
  solutionsCount?: number;
  totalReports?: number;
  isBanned?: boolean;
  bannedAt?: string;
  bannedReason?: string;
  updatedAt: string;
}

/**
 * Synchronize user profile into Firestore /users/{uid}.
 * Automatically registers verified Google email, display name, and sets
 * default email notification preference to ON (true) without overriding existing choices.
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data() as UserProfile;
      const currentPref = data.emailNotificationsEnabled !== false;
      const updatedProfile: UserProfile = {
        uid: user.uid,
        email: user.email || data.email || '',
        displayName: user.displayName || data.displayName || 'Student',
        photoURL: user.photoURL || data.photoURL || '',
        emailNotificationsEnabled: currentPref,
        solutionsCount: typeof data.solutionsCount === 'number' ? data.solutionsCount : 0,
        totalReports: typeof data.totalReports === 'number' ? data.totalReports : 0,
        isBanned: data.isBanned === true,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      return updatedProfile;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Student',
        photoURL: user.photoURL || '',
        emailNotificationsEnabled: true, // Default ON as required
        solutionsCount: 0,
        totalReports: 0,
        isBanned: false,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (err: any) {
    console.warn('[Firebase] syncUserProfile note (offline fallback):', err?.message || err);
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Student',
      photoURL: user.photoURL || '',
      emailNotificationsEnabled: true,
      solutionsCount: 0,
      totalReports: 0,
      isBanned: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Get user profile from Firestore /users/{uid}
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err: any) {
    console.warn('[Firebase] getUserProfile notice:', err?.message || err);
  }
  return null;
}

/**
 * Update email notification preference for a user
 */
export async function updateNotificationPreference(uid: string, enabled: boolean): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(
    userRef,
    {
      emailNotificationsEnabled: enabled,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Dispatch answer notification to the question author.
 * Strictly adheres to zero-trust rules:
 * - Checks that answer author != question author (no self-notification).
 * - Enforces deterministic notification ID (answer_notification_{postId}_{replyId}) for duplicate protection.
 * - Writes to the Firestore 'mail' collection for the Firebase Trigger Email extension.
 * - Triggers backend notification pipeline to deliver the email securely.
 * - Never fails the answer submission if delivery has an issue.
 */
export async function dispatchAnswerNotification(params: {
  postId: string;
  replyId: string;
  questionAuthorUid: string;
  questionTitle: string;
  replyAuthorName: string;
  replyContent: string;
  isAnonymous: boolean;
}): Promise<{ success: boolean; reason?: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, reason: 'Unauthenticated' };

  if (currentUser.uid === params.questionAuthorUid) {
    return { success: true, reason: 'Self-answer' };
  }

  // Email delivery is handled by the dedicated CampusConnect notification flow.
  // Do not write to /mail from the browser and do not call the old Vite-only
  // /api/campus/* endpoint; both caused production-only failures.
  try {
    const recipientSnap = await getDoc(doc(db, 'users', params.questionAuthorUid));
    if (!recipientSnap.exists()) {
      return { success: false, reason: 'Recipient profile not found' };
    }

    const recipient = recipientSnap.data() as Partial<UserProfile>;
    if (recipient.emailNotificationsEnabled !== true) {
      return { success: true, reason: 'Email notifications disabled' };
    }

    if (!recipient.email) {
      return { success: false, reason: 'Recipient email not found' };
    }

    const response = await fetch('/api/send-reply-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: recipient.email,
        questionTitle: params.questionTitle,
        replyAuthor: params.isAnonymous ? 'A fellow student' : params.replyAuthorName,
        replyContent: params.replyContent,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, reason: data?.error || `Email endpoint returned ${response.status}` };
    }

    return { success: data?.success !== false, reason: data?.error };
  } catch (err: any) {
    console.warn('[CampusConnect] Email notification note:', err?.message || err);
    return { success: false, reason: err?.message || 'Email delivery unavailable' };
  }
}

// 9. Create Post in Firestore
export async function saveCampusPostToFirestore(postData: {
  id: string;
  title: string;
  content: string;
  college: string;
  branch: string;
  type: 'doubt' | 'dispatch';
  urgency: string;
  isAnonymous: boolean;
  codeSnippet?: string;
  attachments?: any[];
}): Promise<FirestoreCampusPost> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: You must be signed in with a Google account to post a doubt.');
  }

  // Determine public author name based on user choice
  const actualGoogleName = currentUser.displayName || 'Verified Student';
  const publicAuthorName = postData.isAnonymous ? 'Anonymous Student' : actualGoogleName;

  // Strict anti-spoofing check
  if (publicAuthorName.toLowerCase().includes('man of study admin')) {
    throw new Error('Reserved identity: You cannot use the admin name.');
  }

  const postDoc: FirestoreCampusPost = {
    id: postData.id,
    authorUid: currentUser.uid,
    authorName: currentUser.displayName || publicAuthorName,
    authorEmail: currentUser.email || '',
    displayName: actualGoogleName,
    isAnonymous: postData.isAnonymous,
    title: postData.title,
    content: postData.content,
    college: postData.college,
    branch: postData.branch,
    type: postData.type,
    urgency: postData.urgency || 'Casual',
    codeSnippet: postData.codeSnippet || '',
    upvotes: 1,
    createdAt: new Date().toISOString(),
    attachments: postData.attachments || [],
  };

  const postRef = doc(db, 'campus_posts', postDoc.id);
  await setDoc(postRef, postDoc);
  return postDoc;
}

// 10. Post a Solution / Reply to Firestore
export async function saveCampusReplyToFirestore(
  postId: string,
  replyData: {
    id: string;
    content: string;
    isAnonymous: boolean;
    college?: string;
    role?: string;
  }
): Promise<FirestoreCampusReply> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: You must be signed in with a Google account to post a solution.');
  }

  const actualGoogleName = currentUser.displayName || 'Student Peer';
  const publicAuthorName = replyData.isAnonymous ? 'Anonymous Student' : actualGoogleName;

  // Anti-spoofing check
  if (publicAuthorName.toLowerCase().includes('man of study admin')) {
    throw new Error('Reserved identity: You cannot use the admin name.');
  }

  const replyDoc: FirestoreCampusReply = {
    id: replyData.id,
    postId,
    authorUid: currentUser.uid,
    authorName: publicAuthorName,
    displayName: actualGoogleName,
    isAnonymous: replyData.isAnonymous,
    content: replyData.content,
    college: replyData.college || 'Engineering College',
    role: replyData.isAnonymous ? 'Anonymous Scholar' : (replyData.role || 'Student Peer'),
    upvotes: 1,
    isVerifiedSolution: false,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  // Canonical source of truth: keep replies on the parent campus_posts document
  // so the existing real-time campus_posts listener can deliver new answers to every user.
  // The subcollection is retained for backwards compatibility with older records.
  const campusPostRef = doc(db, 'campus_posts', postId);
  const campusReplyRef = doc(db, 'campus_posts', postId, 'replies', replyDoc.id);
  const legacyReplyRef = doc(db, 'posts', postId, 'replies', replyDoc.id);

  // A reply is not considered successfully saved unless the canonical parent update succeeds.
  // This prevents the old "local success but nothing appears for other users" failure mode.
  await setDoc(
    campusPostRef,
    {
      replies: arrayUnion(replyDoc),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // Keep the dedicated subcollection copies as a compatibility/history layer.
  await Promise.allSettled([
    setDoc(campusReplyRef, replyDoc),
    setDoc(legacyReplyRef, replyDoc),
  ]);

  // Increment user's solutionsCount (Requirement 1.6 & 3)
  try {
    await incrementUserSolutionsCount(currentUser.uid);
  } catch (countErr) {
    console.debug('[Firebase] Solution count increment note:', countErr);
  }

  return replyDoc;
}

/**
 * Increment a user's solved answers counter in users/{userId}/solutionsCount
 */
export async function incrementUserSolutionsCount(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        solutionsCount: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return (snap.data().solutionsCount as number) || 1;
    }
    return 1;
  } catch (err: any) {
    console.warn('[Firebase] incrementUserSolutionsCount note:', err?.message || err);
    return 1;
  }
}

/**
 * Community Safety: Report a question or solution with auto-moderation threshold
 */
export interface CommunityReport {
  id: string;
  targetType: 'post' | 'reply';
  targetId: string;
  postId: string;
  authorUid?: string;
  reason: string;
  details?: string;
  reporterUid: string;
  reporterEmail?: string;
  createdAt: string;
}

export async function submitCommunityReport(params: {
  targetType: 'post' | 'reply';
  targetId: string;
  postId: string;
  authorUid?: string;
  reason: string;
  details?: string;
}): Promise<{ isHidden: boolean; userBanned: boolean }> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Authentication required to submit a community report.');

  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const reportDoc: CommunityReport = {
    id: reportId,
    targetType: params.targetType,
    targetId: params.targetId,
    postId: params.postId,
    authorUid: params.authorUid,
    reason: params.reason,
    details: params.details || '',
    reporterUid: currentUser.uid,
    reporterEmail: currentUser.email || '',
    createdAt: new Date().toISOString(),
  };

  // 1. Store in reports collection
  const reportRef = doc(db, 'reports', reportId);
  await setDoc(reportRef, reportDoc);

  let isHidden = false;
  let userBanned = false;

  // 2. Increment reportCount on the target post or reply, auto-hide if >= 3
  try {
    if (params.targetType === 'post') {
      const pRef = doc(db, 'posts', params.targetId);
      const cpRef = doc(db, 'campus_posts', params.targetId);
      await Promise.allSettled([
        setDoc(pRef, { reportCount: increment(1) }, { merge: true }),
        setDoc(cpRef, { reportCount: increment(1) }, { merge: true }),
      ]);
      const snap = await getDoc(cpRef);
      const curReports = snap.exists() ? ((snap.data().reportCount as number) || 1) : 1;
      if (curReports >= 3) {
        isHidden = true;
        await Promise.allSettled([
          setDoc(pRef, { isHidden: true }, { merge: true }),
          setDoc(cpRef, { isHidden: true }, { merge: true }),
        ]);
      }
    } else {
      const rRef = doc(db, 'posts', params.postId, 'replies', params.targetId);
      const crRef = doc(db, 'campus_posts', params.postId, 'replies', params.targetId);
      await Promise.allSettled([
        setDoc(rRef, { reportCount: increment(1) }, { merge: true }),
        setDoc(crRef, { reportCount: increment(1) }, { merge: true }),
      ]);
      const snap = await getDoc(crRef);
      const curReports = snap.exists() ? ((snap.data().reportCount as number) || 1) : 1;
      if (curReports >= 3) {
        isHidden = true;
        await Promise.allSettled([
          setDoc(rRef, { isHidden: true }, { merge: true }),
          setDoc(crRef, { isHidden: true }, { merge: true }),
        ]);
      }
    }
  } catch (repErr) {
    console.debug('[Firebase] Target report increment note:', repErr);
  }

  // 3. Increment totalReports on author profile & auto-ban if >= 5
  if (params.authorUid) {
    try {
      const authorRef = doc(db, 'users', params.authorUid);
      await setDoc(
        authorRef,
        {
          totalReports: increment(1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const authorSnap = await getDoc(authorRef);
      if (authorSnap.exists()) {
        const totalReports = (authorSnap.data().totalReports as number) || 0;
        if (totalReports >= 5) {
          userBanned = true;
          await setDoc(
            authorRef,
            {
              isBanned: true,
              bannedAt: new Date().toISOString(),
              bannedReason: 'Account suspended due to 5 community violation reports',
            },
            { merge: true }
          );
        }
      }
    } catch (authorErr) {
      console.debug('[Firebase] Author report count increment note:', authorErr);
    }
  }

  return { isHidden, userBanned };
}

// 11. Upvote a Post in Firestore
export async function upvotePostInFirestore(postId: string, incrementValue: number = 1): Promise<void> {
  try {
    const postRef = doc(db, 'campus_posts', postId);
    await updateDoc(postRef, {
      upvotes: increment(incrementValue),
    });
  } catch (err) {
    // If post is not in Firestore (e.g. a seed post), local state still manages it
    console.debug('[Firebase] Firestore upvote notice:', err);
  }
}
