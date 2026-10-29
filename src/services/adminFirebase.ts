import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, inMemoryPersistence, initializeAuth, type Auth } from "firebase/auth";
import { getFunctions, type Functions } from "firebase/functions";
import firebaseAppletConfig from "../../firebase-applet-config.json";

/**
 * Dedicated Firebase app + Auth instance for the private owner portal (/theone).
 *
 * Why a separate named app instead of the shared public one:
 *  - Signing the owner in with email/password must not change the public site's
 *    student auth state (and a signed-in student must not be signed out by
 *    visiting /theone).
 *  - Auth state is kept in memory only, so closing or refreshing the page never
 *    leaves a reusable owner credential in browser storage. The server-side admin
 *    session token is likewise held in memory only (see AdminPortal).
 *
 * It uses the same Firebase project (manofstudy-live) as the rest of the site.
 */
const ADMIN_APP_NAME = "naa-admin-portal";
const ADMIN_FUNCTIONS_REGION = "asia-southeast1";

const adminFirebaseOptions = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
};

function resolveAdminApp(): FirebaseApp {
  return (
    getApps().find((candidate) => candidate.name === ADMIN_APP_NAME) ??
    initializeApp(adminFirebaseOptions, ADMIN_APP_NAME)
  );
}

function resolveAdminAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    // Already initialized (e.g. Vite hot reload).
    return getAuth(app);
  }
}

export const adminApp: FirebaseApp = resolveAdminApp();
export const adminAuth: Auth = resolveAdminAuth(adminApp);
export const adminFunctions: Functions = getFunctions(adminApp, ADMIN_FUNCTIONS_REGION);
