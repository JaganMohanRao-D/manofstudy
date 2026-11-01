import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { adminAuth, adminFunctions } from "../services/adminFirebase";
import { loginErrorMessage } from "../components/admin/adminAuthMessages";

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "jaganmakes@gmail.com").trim().toLowerCase();
const verifyIdentityCall = httpsCallable<Record<string, never>, { valid: boolean }>(adminFunctions, "verifyNaaAdminIdentity");
const logoutCall = httpsCallable<Record<string, never>, { success: boolean }>(adminFunctions, "logoutNaaAdmin");

type AdminAuthValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const authActionInProgress = useRef(false);

  const clearLocalAuth = useCallback(async () => {
    setUser(null);
    setIsAdmin(false);
    await signOut(adminAuth).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(adminAuth, async (nextUser) => {
      if (!active || authActionInProgress.current) return;
      if (!nextUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      if ((nextUser.email || "").trim().toLowerCase() !== ADMIN_EMAIL || !nextUser.emailVerified) {
        await clearLocalAuth();
        if (active) setLoading(false);
        return;
      }
      try {
        const { data } = await verifyIdentityCall({});
        if (!active) return;
        if (!data.valid) {
          await clearLocalAuth();
          return;
        }
        setUser(nextUser);
        setIsAdmin(true);
      } catch {
        await clearLocalAuth();
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [clearLocalAuth]);

  // Re-check the verified owner identity periodically and when the admin tab
  // becomes visible again. Every content callable also performs its own check.
  useEffect(() => {
    if (!isAdmin) return;
    const verify = async () => {
      try {
        const { data } = await verifyIdentityCall({});
        if (!data.valid) await clearLocalAuth();
      } catch (error) {
        const code = String((error as { code?: unknown })?.code || "");
        if (code.includes("permission-denied") || code.includes("unauthenticated")) {
          await clearLocalAuth();
        }
      }
    };
    const interval = window.setInterval(() => void verify(), 5 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void verify();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAdmin, clearLocalAuth]);

  const login = useCallback(async (email: string, password: string) => {
    authActionInProgress.current = true;
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== ADMIN_EMAIL) {
        throw Object.assign(new Error("Unauthorized account"), { code: "permission-denied" });
      }
      if (!password) {
        throw Object.assign(new Error("Password required"), { code: "auth/missing-password" });
      }

      const credential = await signInWithEmailAndPassword(adminAuth, normalizedEmail, password);
      if ((credential.user.email || "").trim().toLowerCase() !== ADMIN_EMAIL) {
        await signOut(adminAuth).catch(() => undefined);
        throw Object.assign(new Error("Unauthorized account"), { code: "permission-denied" });
      }
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user).catch(() => undefined);
        await signOut(adminAuth).catch(() => undefined);
        throw Object.assign(new Error("Email verification required"), {
          code: "permission-denied",
          details: { reason: "email-not-verified" },
        });
      }

      const { data } = await verifyIdentityCall({});
      if (!data.valid) throw Object.assign(new Error("Unauthorized account"), { code: "permission-denied" });

      setUser(credential.user);
      setIsAdmin(true);
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
      await signOut(adminAuth).catch(() => undefined);
      throw new Error(loginErrorMessage(error));
    } finally {
      authActionInProgress.current = false;
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    authActionInProgress.current = true;
    try {
      // The backend revokes refresh tokens; local sign-out then clears this
      // browser's persisted Firebase session.
      await logoutCall({});
    } catch (error) {
      console.warn("[NaaAdmin] Server token revocation was not confirmed.", error);
    } finally {
      await signOut(adminAuth).catch(() => undefined);
      setUser(null);
      setIsAdmin(false);
      authActionInProgress.current = false;
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return value;
}
