import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDelp9sBAtqVQ-YMP5zpdi1b_G_yafRRk",
  authDomain: "naa-college.firebaseapp.com",
  projectId: "naa-college",
  storageBucket: "naa-college.firebasestorage.app",
  messagingSenderId: "283454436896",
  appId: "1:283454436896:web:2841510b2f26162e9fae45",
  measurementId: "G-FZN0DVCZ5J"
};

// Initialize Firebase safely without duplicate initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
export const db = getFirestore(app);
export { signInWithPopup, signOut };
export default app;
