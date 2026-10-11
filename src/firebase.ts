import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAi1z2yWqdDXzeip3TUC37huvsChqK8Lqo",
  authDomain: "manofstudy-live.firebaseapp.com",
  projectId: "manofstudy-live",
  storageBucket: "manofstudy-live.firebasestorage.app",
  messagingSenderId: "9699503499",
  appId: "1:9699503499:web:2798a930e61a310c75538e",
  measurementId: "G-CBFMX3VKF4"
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
