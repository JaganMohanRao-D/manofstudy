import { useEffect, useState, type FormEvent } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  LockKeyhole,
  Globe2,
} from "lucide-react";
import { app, auth, googleProvider } from "../../services/firebase";

const ADMIN_EMAIL = "jaganmakes@gmail.com";
const functions = getFunctions(app, "asia-southeast1");

type LoginResponse = {
  sessionToken: string;
  expiresAt: string;
  ownerEmail: string;
};

type SessionResponse = {
  valid: boolean;
  ownerEmail: string;
};

const loginWithGoogleCall = httpsCallable<Record<string, never>, LoginResponse>(
  functions,
  "loginWithGoogleNaaAdmin"
);
const verifySessionCall = httpsCallable<
  { sessionToken: string },
  SessionResponse
>(functions, "verifyNaaAdminSession");
const logoutCall = httpsCallable<{ sessionToken: string }, { success: boolean }>(
  functions,
  "logoutNaaAdmin"
);

function readableError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: unknown }).code || "");
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return "Google sign-in was cancelled.";
    }
    if (code === "functions/permission-denied" || code === "functions/unauthenticated") {
      return "Access denied. Only the verified Google account jaganmakes@gmail.com is allowed.";
    }
    if (code === "auth/popup-blocked") {
      return "Your browser blocked the Google sign-in popup. Allow popups for this site and try again.";
    }
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message || "");
    if (message.toLowerCase().includes("failed to fetch")) {
      return "Could not reach the secure sign-in service. Check the deployment and try again.";
    }
    return message.replace(/^FirebaseError:\s*/i, "") || "The request could not be completed.";
  }
  return "The request could not be completed. Please try again.";
}

export default function AdminPortal() {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionChecking, setSessionChecking] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState(ADMIN_EMAIL);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Private Admin | Naa College";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!sessionToken) {
      setSessionChecking(false);
      return;
    }
    let active = true;
    setSessionChecking(true);
    verifySessionCall({ sessionToken })
      .then(({ data }) => {
        if (!active) return;
        if (!data.valid) {
          setSessionToken(null);
          setNotice("Your admin session has ended. Please sign in again.");
          return;
        }
        setOwnerEmail(data.ownerEmail || ADMIN_EMAIL);
      })
      .catch(() => {
        if (!active) return;
        setSessionToken(null);
        setNotice("Your admin session could not be verified. Please sign in again.");
      })
      .finally(() => {
        if (active) setSessionChecking(false);
      });
    return () => {
      active = false;
    };
  }, [sessionToken]);

  async function handleGoogleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    setBusy(true);

    try {
      // The frontend check provides fast feedback only. The callable function
      // independently enforces the exact email/provider/verified-email allowlist.
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;
      const normalizedEmail = (user.email || "").trim().toLowerCase();
      const isGoogleProvider = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      if (
        normalizedEmail !== ADMIN_EMAIL ||
        user.emailVerified !== true ||
        !isGoogleProvider
      ) {
        await signOut(auth).catch(() => {});
        setFormError(
          "Access denied. Please choose the verified Google account jaganmakes@gmail.com."
        );
        return;
      }

      // Firebase automatically attaches the authenticated ID token to this
      // callable request. The backend must validate the same allowlist again.
      const result = await loginWithGoogleCall({});
      setOwnerEmail(result.data.ownerEmail || ADMIN_EMAIL);
      setSessionToken(result.data.sessionToken);
      setNotice("");
    } catch (error) {
      await signOut(auth).catch(() => {});
      setFormError(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const token = sessionToken;
    setSessionToken(null);
    setFormError("");
    setNotice("You have signed out.");
    try {
      if (token) await logoutCall({ sessionToken: token });
    } catch {
      // In-memory token is cleared locally. Server-side sessions also expire.
    } finally {
      await signOut(auth).catch(() => {});
    }
  }

  const buttonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md">
        <header className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
            <ShieldCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
            Private owner access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Naa College Admin</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
            Restricted management access. Only one verified Google account is authorized.
          </p>
        </header>

        {sessionToken ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
              <div>
                <h2 className="text-lg font-semibold">Owner session active</h2>
                <p className="mt-1 break-all text-sm text-slate-600">{ownerEmail}</p>
              </div>
            </div>
            {sessionChecking ? (
              <p className="mt-5 text-sm text-slate-600">Verifying session with the server…</p>
            ) : (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                Your Google identity and admin session are checked by the server. Protected content actions must independently verify the session before writing data.
              </p>
            )}
            <button type="button" className={buttonClass + " mt-5"} onClick={handleLogout}>
              <LogOut aria-hidden="true" className="h-4 w-4" /> Sign out
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h2 className="text-lg font-semibold">Sign in with Google</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Only the account listed below can access this private admin portal. All other accounts are rejected.
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Authorized account
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-800">{ADMIN_EMAIL}</p>
            </div>

            <form onSubmit={handleGoogleLogin}>
              <button className={buttonClass} type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe2 aria-hidden="true" className="h-4 w-4" />
                )}
                {busy ? "Verifying Google account…" : "Continue with Google"}
              </button>
            </form>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Google email verification and the owner allowlist are enforced again on the server. No password setup or public signup is available here.
            </p>
          </section>
        )}

        {(formError || notice) && (
          <div
            className={
              "mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm leading-6 " +
              (formError
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-900")
            }
            role={formError ? "alert" : "status"}
          >
            {formError ? (
              <AlertCircle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
            )}
            <span>{formError || notice}</span>
          </div>
        )}

        <footer className="mt-6 text-center">
          <p className="text-xs leading-5 text-slate-500">
            Private route • Exact-email allowlist • Server-side authorization
          </p>
        </footer>
      </div>
    </main>
  );
}
