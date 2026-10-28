import { useEffect, useState, type FormEvent } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { signInWithPopup, signOut } from "firebase/auth";
import { CheckCircle2, LoaderCircle, LogOut, ShieldCheck, AlertCircle } from "lucide-react";
import { app, auth, googleProvider } from "../../services/firebase";

const functions = getFunctions(app, "asia-southeast1");

type LoginResponse = {
  sessionToken: string;
  expiresAt: string;
};

type SessionResponse = {
  valid: boolean;
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
      return "Sign-in cancelled.";
    }
    if (code === "functions/permission-denied" || code === "functions/unauthenticated") {
      return "This Google account is not authorized.";
    }
    if (code === "functions/resource-exhausted") {
      return "Too many attempts. Please try again later.";
    }
    if (code === "auth/popup-blocked") {
      return "Your browser blocked the Google sign-in window.";
    }
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message || "").toLowerCase();
    if (message.includes("failed to fetch")) {
      return "Sign-in service is temporarily unavailable.";
    }
  }
  return "Sign-in failed. Please try again.";
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.1 7.14-10.15 7.14-17.56Z" transform="translate(0 -1)" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 2)" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -3)" />
    </svg>
  );
}

function BrandHeader() {
  return (
    <header className="mb-8 flex flex-col items-center text-center">
      <img
        src="/Naa%20College%20logo.webp"
        alt="Naa College logo"
        className="mb-6 h-20 w-20 object-contain drop-shadow-sm"
        width={80}
        height={80}
        fetchPriority="high"
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[2.1rem]">
        Admin Sign In
      </h1>
      <div aria-hidden="true" className="mt-4 h-1 w-14 rounded-full bg-emerald-600" />
    </header>
  );
}

export default function AdminPortal() {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionChecking, setSessionChecking] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Admin Sign In | Naa College";
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
        if (active && !data.valid) setSessionToken(null);
      })
      .catch(() => {
        if (active) setSessionToken(null);
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
    setBusy(true);

    try {
      // The server is the source of truth and independently validates the
      // authenticated Google identity, verified email, and exact allowlist.
      await signInWithPopup(auth, googleProvider);
      const result = await loginWithGoogleCall({});
      setSessionToken(result.data.sessionToken);
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
    try {
      if (token) await logoutCall({ sessionToken: token });
    } catch {
      // Clear the local session even if network revocation cannot be confirmed.
    } finally {
      await signOut(auth).catch(() => {});
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4faf6] px-4 py-10 text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-emerald-200/55 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-amber-200/55 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-[15%] h-24 w-24 rounded-full bg-sky-200/50 blur-2xl" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-[30px] border border-white bg-white/95 p-7 shadow-[0_24px_70px_-28px_rgba(15,70,49,0.25)] ring-1 ring-emerald-900/5 backdrop-blur-sm sm:p-10">
          <BrandHeader />

          {sessionToken ? (
            <div className="space-y-4">
              {sessionChecking ? (
                <div className="flex justify-center py-3" role="status" aria-label="Verifying session">
                  <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-emerald-700" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                  Signed in
                </div>
              )}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                onClick={handleLogout}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleGoogleLogin}>
                <button
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/60 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-600/15 disabled:cursor-not-allowed disabled:opacity-65"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? (
                    <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-emerald-700" />
                  ) : (
                    <GoogleMark />
                  )}
                  <span>{busy ? "Signing in…" : "Sign in with Google"}</span>
                </button>
              </form>

              {formError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-center text-sm font-medium text-rose-800"
                >
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
