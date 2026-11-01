import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { adminAuth, adminFunctions } from "../services/adminFirebase";
import { loginErrorMessage } from "../components/admin/adminAuthMessages";

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "jaganmakes@gmail.com").trim().toLowerCase();
const SESSION_STORAGE_KEY = "naa_college_admin_session_v2";
const verifySessionCall = httpsCallable<{ sessionToken: string }, { valid: boolean }>(adminFunctions, "verifyNaaAdminSession");
const loginCall = httpsCallable<Record<string, never>, { sessionToken: string; expiresAt: string }>(adminFunctions, "loginWithPasswordNaaAdmin");
const logoutCall = httpsCallable<{ sessionToken: string }, { success: boolean }>(adminFunctions, "logoutNaaAdmin");

type StoredAdminSession = { token: string; expiresAt: number };
type AdminAuthValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

function readStoredSession(): StoredAdminSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredAdminSession>;
    if (typeof value.token !== "string" || !value.token || !Number.isFinite(value.expiresAt)) return null;
    return { token: value.token, expiresAt: Number(value.expiresAt) };
  } catch {
    return null;
  }
}

function clearStoredSession() {
  try { window.localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<StoredAdminSession | null>(null);
  const loginInProgress = useRef(false);

  const endLocalSession = useCallback(async () => {
    clearStoredSession();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    await signOut(adminAuth).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(adminAuth, async (nextUser) => {
      if (!active || loginInProgress.current) return;
      if (!nextUser) {
        setUser(null);
        setIsAdmin(false);
        setSession(null);
        setLoading(false);
        return;
      }
      if ((nextUser.email || "").trim().toLowerCase() !== ADMIN_EMAIL || !nextUser.emailVerified) {
        await endLocalSession();
        if (active) setLoading(false);
        return;
      }
      const stored = readStoredSession();
      if (!stored || stored.expiresAt <= Date.now()) {
        await endLocalSession();
        if (active) setLoading(false);
        return;
      }
      try {
        const { data } = await verifySessionCall({ sessionToken: stored.token });
        if (!active) return;
        if (!data.valid) {
          await endLocalSession();
          return;
        }
        setUser(nextUser);
        setSession(stored);
        setIsAdmin(true);
      } catch {
        await endLocalSession();
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [endLocalSession]);

  useEffect(() => {
    if (!isAdmin || !session) return;
    const verify = async () => {
      if (Date.now() >= session.expiresAt) {
        await endLocalSession();
        return;
      }
      try {
        const { data } = await verifySessionCall({ sessionToken: session.token });
        if (!data.valid) await endLocalSession();
      } catch {
        await endLocalSession();
      }
    };
    const interval = window.setInterval(() => void verify(), 4 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void verify();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAdmin, session, endLocalSession]);

  const login = useCallback(async (email: string, password: string) => {
    loginInProgress.current = true;
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== ADMIN_EMAIL) {
        const denied = Object.assign(new Error("Unauthorized account"), { code: "permission-denied" });
        throw denied;
      }
      if (!password) throw Object.assign(new Error("Password required"), { code: "auth/missing-password" });
      const credential = await signInWithEmailAndPassword(adminAuth, normalizedEmail, password);
      if ((credential.user.email || "").trim().toLowerCase() !== ADMIN_EMAIL || !credential.user.emailVerified) {
        await signOut(adminAuth).catch(() => undefined);
        throw Object.assign(new Error("Unauthorized account"), { code: "permission-denied" });
      }
      const { data } = await loginCall({});
      const expiresAt = Date.parse(data.expiresAt);
      if (!data.sessionToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        throw new Error("The admin session could not be created.");
      }
      const nextSession = { token: data.sessionToken, expiresAt };
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
      setUser(credential.user);
      setSession(nextSession);
      setIsAdmin(true);
    } catch (error) {
      clearStoredSession();
      setSession(null);
      setIsAdmin(false);
      await signOut(adminAuth).catch(() => undefined);
      const mapped = loginErrorMessage(error);
      throw new Error(mapped);
    } finally {
      loginInProgress.current = false;
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const stored = readStoredSession();
    clearStoredSession();
    setSession(null);
    setIsAdmin(false);
    setUser(null);
    try {
      if (stored?.token) await logoutCall({ sessionToken: stored.token });
    } catch (error) {
      console.warn('[NaaAdmin] Server session revocation was not confirmed; the session will expire automatically.', error);
    } finally {
      await signOut(adminAuth).catch(() => undefined);
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
