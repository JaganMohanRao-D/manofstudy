import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { httpsCallable } from "firebase/functions";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { adminAuth, adminFunctions } from "../../services/adminFirebase";
import {
  RESET_NEUTRAL_MESSAGE,
  loginErrorMessage,
  resetContinueUrl,
  resetErrorMessage,
  validateLoginInput,
  validateResetInput,
} from "./adminAuthMessages";

type LoginResponse = {
  sessionToken: string;
  expiresAt: string;
};

type SessionResponse = {
  valid: boolean;
};

type AdminSession = {
  token: string;
  expiresAtMs: number;
};

type View = "signin" | "reset";

// The backend remains the authority: it validates the Firebase identity and
// issues/validates/revokes the opaque session. Nothing here grants access.
const loginCall = httpsCallable<Record<string, never>, LoginResponse>(
  adminFunctions,
  "loginWithPasswordNaaAdmin"
);
const verifySessionCall = httpsCallable<{ sessionToken: string }, SessionResponse>(
  adminFunctions,
  "verifyNaaAdminSession"
);
const logoutCall = httpsCallable<{ sessionToken: string }, { success: boolean }>(
  adminFunctions,
  "logoutNaaAdmin"
);

const SESSION_RECHECK_INTERVAL_MS = 5 * 60 * 1000;

const inputClasses =
  "block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";
const labelClasses = "mb-1.5 block text-sm font-semibold text-slate-700";
const primaryButtonClasses =
  "flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-700 px-5 py-4 text-base font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-600/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65";
const linkButtonClasses =
  "rounded-md text-sm font-semibold text-emerald-700 underline-offset-4 transition hover:text-emerald-800 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60";

function BrandHeader({ title }: { title: string }) {
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
        {title}
      </h1>
      <div aria-hidden="true" className="mt-4 h-1 w-14 rounded-full bg-emerald-600" />
    </header>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-4 flex items-start justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-center text-sm font-medium text-rose-800"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function AdminPortal() {
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [resetNotice, setResetNotice] = useState("");
  // Held in memory only: never written to localStorage/sessionStorage/cookies,
  // so a refresh always requires signing in again.
  const [session, setSession] = useState<AdminSession | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Admin Sign In | Naa College";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const endSession = useCallback((message: string) => {
    setSession(null);
    setPassword("");
    setShowPassword(false);
    setView("signin");
    setFormError(message);
    void signOut(adminAuth).catch(() => {});
  }, []);

  // While signed in: drop the UI the moment the session expires, and re-verify
  // with the server periodically and when the tab becomes visible again so a
  // revoked or expired session cannot linger on screen.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const recheck = async () => {
      if (Date.now() >= session.expiresAtMs) {
        endSession("Your session expired. Please sign in again.");
        return;
      }
      try {
        const { data } = await verifySessionCall({ sessionToken: session.token });
        if (!cancelled && !data.valid) {
          endSession("Your session expired. Please sign in again.");
        }
      } catch {
        if (!cancelled) {
          endSession("Your session could not be verified. Please sign in again.");
        }
      }
    };

    const expiryTimer = window.setTimeout(
      () => endSession("Your session expired. Please sign in again."),
      Math.max(0, session.expiresAtMs - Date.now())
    );
    const interval = window.setInterval(() => void recheck(), SESSION_RECHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void recheck();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(expiryTimer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session, endSession]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;

    setFormError("");
    setResetNotice("");
    const validationError = validateLoginInput(email, password);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    busyRef.current = true;
    setBusy(true);
    try {
      // 1. Firebase Authentication (email/password provider).
      await signInWithEmailAndPassword(adminAuth, email.trim(), password);
      // 2. The callable SDK attaches the signed-in user's ID token. The backend
      //    independently authorizes the owner and creates the server-side session.
      const result = await loginCall({});
      const token = result.data.sessionToken;
      const expiresAtMs = Date.parse(result.data.expiresAt);
      if (!token || !Number.isFinite(expiresAtMs)) {
        throw new Error("Missing admin session");
      }
      // 3. Only show the authenticated state once the server confirms the session.
      const check = await verifySessionCall({ sessionToken: token });
      if (!check.data.valid) {
        throw new Error("Admin session was not confirmed");
      }
      setSession({ token, expiresAtMs });
    } catch (error) {
      await signOut(adminAuth).catch(() => {});
      setSession(null);
      setFormError(loginErrorMessage(error));
    } finally {
      // Never keep the password in component state after an attempt.
      setPassword("");
      setShowPassword(false);
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;

    setFormError("");
    setResetNotice("");
    const validationError = validateResetInput(email);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    busyRef.current = true;
    setBusy(true);
    try {
      const continueUrl = resetContinueUrl(window.location);
      // Firebase's official reset mechanism. This never creates an account, and
      // the confirmation below is identical whether or not the email is registered.
      await sendPasswordResetEmail(
        adminAuth,
        email.trim(),
        continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined
      );
      setResetNotice(RESET_NEUTRAL_MESSAGE);
    } catch (error) {
      const message = resetErrorMessage(error);
      if (message === null) {
        setResetNotice(RESET_NEUTRAL_MESSAGE);
      } else {
        setFormError(message);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function handleLogout() {
    const token = session?.token;
    setSession(null);
    setPassword("");
    setShowPassword(false);
    setFormError("");
    setResetNotice("");
    try {
      // Revoke on the server first (needs the Firebase ID token), then sign out.
      if (token) await logoutCall({ sessionToken: token });
    } catch {
      setFormError("Signed out here, but the server could not confirm the session was revoked. It will expire automatically.");
    } finally {
      await signOut(adminAuth).catch(() => {});
    }
  }

  function switchView(next: View) {
    setView(next);
    setFormError("");
    setResetNotice("");
    setPassword("");
    setShowPassword(false);
  }

  const expiryLabel = session
    ? new Date(session.expiresAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4faf6] px-4 py-10 text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-emerald-200/55 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-amber-200/55 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-[15%] h-24 w-24 rounded-full bg-sky-200/50 blur-2xl" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-[30px] border border-white bg-white/95 p-7 shadow-[0_24px_70px_-28px_rgba(15,70,49,0.25)] ring-1 ring-emerald-900/5 backdrop-blur-sm sm:p-10">
          <BrandHeader title={session ? "Admin" : view === "reset" ? "Reset Password" : "Admin Sign In"} />

          {session ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                Signed in
              </div>
              <p className="text-center text-xs text-slate-500">Session ends at {expiryLabel}</p>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/15"
                onClick={handleLogout}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sign out
              </button>
              <ErrorBanner message={formError} />
            </div>
          ) : view === "signin" ? (
            <form onSubmit={handleSignIn} noValidate aria-busy={busy} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className={labelClasses}>
                  Email address
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className={inputClasses}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                />
              </div>

              <div>
                <label htmlFor="admin-password" className={labelClasses}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    className={`${inputClasses} pr-14`}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-slate-500 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 disabled:opacity-60"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={busy}
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="h-5 w-5" />
                    ) : (
                      <Eye aria-hidden="true" className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className={linkButtonClasses}
                  onClick={() => switchView("reset")}
                  disabled={busy}
                >
                  Forgot password?
                </button>
              </div>

              <button className={primaryButtonClasses} type="submit" disabled={busy}>
                {busy && <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />}
                <span>{busy ? "Signing in…" : "Sign In"}</span>
              </button>

              <ErrorBanner message={formError} />
            </form>
          ) : (
            <form onSubmit={handleResetRequest} noValidate aria-busy={busy} className="space-y-5">
              <p className="text-center text-sm text-slate-600">
                Enter your email address and we will send a link to set a new password.
              </p>
              <div>
                <label htmlFor="admin-reset-email" className={labelClasses}>
                  Email address
                </label>
                <input
                  id="admin-reset-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  className={inputClasses}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                />
              </div>

              <button className={primaryButtonClasses} type="submit" disabled={busy}>
                {busy && <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />}
                <span>{busy ? "Sending…" : "Send reset link"}</span>
              </button>

              {resetNotice && (
                <div
                  role="status"
                  className="flex items-start justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-center text-sm font-medium text-emerald-800"
                >
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{resetNotice}</span>
                </div>
              )}
              <ErrorBanner message={formError} />

              <div className="flex justify-center">
                <button
                  type="button"
                  className={linkButtonClasses}
                  onClick={() => switchView("signin")}
                  disabled={busy}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
