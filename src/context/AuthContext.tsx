import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogleAccount,
  signOutGoogleAccount,
  subscribeToAuthState,
  testConnection,
  checkRedirectAuth,
} from '../services/firebase';

export interface PendingCampusAction {
  type: 'ask-doubt' | 'post-solution';
  postId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authError: string | null;
  pendingAction: PendingCampusAction | null;
  openAuthModal: (action?: PendingCampusAction) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  clearPendingAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingCampusAction | null>(null);

  useEffect(() => {
    // Initial validation of Firestore connection
    testConnection();

    // Check redirect authentication on mount (for mobile flow)
    checkRedirectAuth().then((redirectedUser) => {
      if (redirectedUser) {
        setUser(redirectedUser);
      }
    });

    // Subscribe to Firebase Auth State listener
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = useCallback((action?: PendingCampusAction) => {
    if (action) {
      setPendingAction(action);
    }
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const loggedUser = await signInWithGoogleAccount();
      if (loggedUser) {
        setUser(loggedUser);
        setIsAuthModalOpen(false);
        return loggedUser;
      }
      // User closed or cancelled the popup peacefully
      return null;
    } catch (err: any) {
      const errorMsg = err?.message || 'Google authentication failed.';
      const isCancellation =
        errorMsg.toLowerCase().includes('cancel') ||
        errorMsg.toLowerCase().includes('closed-by-user') ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request';

      if (isCancellation) {
        console.info('[AuthContext] Sign-in cancelled by user.');
        setAuthError(null);
      } else {
        console.warn('[AuthContext] Sign in notice:', errorMsg);
        setAuthError(errorMsg);
      }
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutGoogleAccount();
      setUser(null);
      setPendingAction(null);
    } catch (err: any) {
      console.warn('[AuthContext] Sign out notice:', err?.message || err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authError,
        pendingAction,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signOut,
        clearPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
