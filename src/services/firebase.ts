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
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// 1. Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 3. Firestore Database
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

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
  } catch (err) {
    console.error('[Firebase] Redirect result error:', err);
  }
  return null;
}

// 5. Sign In With Google (Popup with fallback)
export async function signInWithGoogleAccount(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If popup was blocked or mobile, fallback to redirect if suitable
    if (error.code === 'auth/popup-blocked') {
      console.warn('[Firebase] Popup blocked, attempting redirect sign-in...');
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-In...');
    }
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled by user.');
    }
    console.error('[Firebase] Google sign-in failed:', error);
    throw new Error(error.message || 'Failed to authenticate with Google.');
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
    authorName: publicAuthorName,
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

  const replyRef = doc(db, 'campus_posts', postId, 'replies', replyDoc.id);
  await setDoc(replyRef, replyDoc);
  return replyDoc;
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
