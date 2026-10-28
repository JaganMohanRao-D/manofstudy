import { useEffect, useState, type FormEvent } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArrowRight, CheckCircle2, KeyRound, LockKeyhole, LogOut, ShieldCheck, AlertCircle, LoaderCircle } from "lucide-react";
import { app } from "../../services/firebase";

const ADMIN_EMAIL = "jaganmakes@gmail.com";
const functions = getFunctions(app, "asia-southeast1");

type SetupStatus = {
  needsSetup: boolean;
  ownerEmail: string;
};

type SetupResponse = {
  initialized: boolean;
};

type LoginResponse = {
  sessionToken: string;
  expiresAt: string;
  ownerEmail: string;
};

type SessionResponse = {
  valid: boolean;
  ownerEmail: string;
};

const statusCall = httpsCallable<Record<string, never>, SetupStatus>(functions, "adminSetupStatus");
const setupCall = httpsCallable<
  { email: string; setupKey: string; password: string },
  SetupResponse
>(functions, "initializeNaaAdmin");
const loginCall = httpsCallable<
  { identifier: string; password: string },
  LoginResponse
>(functions, "loginNaaAdmin");
const verifySessionCall = httpsCallable<
  { sessionToken: string },
  SessionResponse
>(functions, "verifyNaaAdminSession");
const logoutCall = httpsCallable<{ sessionToken: string }, { success: boolean }>(
  functions,
  "logoutNaaAdmin"
);

function readableError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message || "");
    if (message.toLowerCase().includes("failed to fetch")) {
      return "Could not reach the secure sign-in service. Check the deployment and try again.";
    }
    return message.replace(/^FirebaseError:\s*/i, "") || "The request could not be completed.";
  }
  return "The request could not be completed. Please try again.";
}

function SecurityMark() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
      <ShieldCheck aria-hidden="true" className="h-7 w-7" />
    </div>
  );
}

export default function AdminPortal() {
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupKey, setSetupKey] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState(ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionChecking, setSessionChecking] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState(ADMIN_EMAIL);

  useEffect(() => {
    document.title = "Private Admin | Naa College";
    let active = true;
    statusCall({})
      .then(({ data }) => {
        if (!active) return;
        setNeedsSetup(data.needsSetup);
        setOwnerEmail(data.ownerEmail || ADMIN_EMAIL);
        setStatusError("");
      })
      .catch((error: unknown) => {
        if (active) setStatusError(readableError(error));
      })
      .finally(() => {
        if (active) setCheckingStatus(false);
      });
    return () => {
      active = false;
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

  async function refreshSetupStatus() {
    setCheckingStatus(true);
    setStatusError("");
    try {
      const result = await statusCall({});
      setNeedsSetup(result.data.needsSetup);
      setOwnerEmail(result.data.ownerEmail || ADMIN_EMAIL);
    } catch (error) {
      setStatusError(readableError(error));
    } finally {
      setCheckingStatus(false);
    }
  }

  async function handleSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (setupPassword.length < 12) {
      setFormError("Choose a password with at least 12 characters.");
      return;
    }
    if (setupPassword !== setupPasswordConfirm) {
      setFormError("The passwords do not match.");
      return;
    }
    if (!setupKey.trim()) {
      setFormError("Enter the one-time owner setup key.");
      return;
    }

    setBusy(true);
    try {
      await setupCall({
        email: ADMIN_EMAIL,
        setupKey,
        password: setupPassword,
      });
      setNeedsSetup(false);
      setSetupKey("");
      setSetupPassword("");
      setSetupPasswordConfirm("");
      setNotice("Owner password saved securely. Sign in with your email and the password you just created.");
    } catch (error) {
      setFormError(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    setBusy(true);
    try {
      const result = await loginCall({
        identifier: loginIdentifier,
        password: loginPassword,
      });
      setLoginPassword("");
      setSessionToken(result.data.sessionToken);
      setOwnerEmail(result.data.ownerEmail || ADMIN_EMAIL);
    } catch (error) {
      setFormError(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const token = sessionToken;
    setSessionToken(null);
    setLoginPassword("");
    setLoginIdentifier(ADMIN_EMAIL);
    setSetupPassword("");
    setSetupPasswordConfirm("");
    setSetupKey("");
    setFormError("");
    setNotice("You have signed out.");
    if (token) {
      try {
        await logoutCall({ sessionToken: token });
      } catch {
        // The token is removed from memory even if the network is unavailable.
      }
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";
  const buttonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md">
        <header className="mb-7 text-center">
          <SecurityMark />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
            Private owner access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Naa College Admin</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
            Restricted management access. Only the configured owner account can sign in.
          </p>
        </header>

        {checkingStatus ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <LoaderCircle aria-hidden="true" className="mx-auto h-6 w-6 animate-spin text-emerald-700" />
            <p className="mt-3 text-sm text-slate-600">Checking secure setup status…</p>
          </section>
        ) : statusError ? (
          <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm" role="alert">
            <AlertCircle aria-hidden="true" className="h-6 w-6 text-rose-700" />
            <p className="mt-3 text-sm leading-6 text-slate-700">{statusError}</p>
            <button type="button" className={buttonClass + " mt-5"} onClick={refreshSetupStatus}>
              Retry secure connection <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </section>
        ) : sessionToken ? (
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
                Sign-in is protected by server-side password verification and a temporary session. Content publishing tools must use server-verified authorization for every write.
              </p>
            )}
            <button type="button" className={buttonClass + " mt-5"} onClick={handleLogout}>
              <LogOut aria-hidden="true" className="h-4 w-4" /> Sign out
            </button>
          </section>
        ) : needsSetup ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <KeyRound aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h2 className="text-lg font-semibold">One-time owner setup</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Create the permanent owner password. This setup can succeed only once, and only with the server-configured setup key.
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fixed owner email</p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-800">{ADMIN_EMAIL}</p>
            </div>

            <form onSubmit={handleSetup} noValidate>
              <label className="block text-sm font-medium text-slate-700" htmlFor="owner-setup-key">
                One-time setup key
              </label>
              <input
                id="owner-setup-key"
                className={inputClass}
                type="password"
                autoComplete="off"
                value={setupKey}
                onChange={(event) => setSetupKey(event.target.value)}
                maxLength={512}
                required
                spellCheck={false}
                placeholder="Enter the private setup key"
              />

              <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="owner-new-password">
                Create password
              </label>
              <input
                id="owner-new-password"
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={setupPassword}
                onChange={(event) => setSetupPassword(event.target.value)}
                minLength={12}
                maxLength={256}
                required
                placeholder="At least 12 characters"
              />

              <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="owner-confirm-password">
                Confirm password
              </label>
              <input
                id="owner-confirm-password"
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={setupPasswordConfirm}
                onChange={(event) => setSetupPasswordConfirm(event.target.value)}
                minLength={12}
                maxLength={256}
                required
                placeholder="Enter the same password again"
              />

              <p className="mt-3 text-xs leading-5 text-slate-500">
                The password is hashed on the server. The original password is not saved in Firestore or included in the built website files.
              </p>
              <button className={buttonClass + " mt-5"} type="submit" disabled={busy}>
                {busy ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <LockKeyhole aria-hidden="true" className="h-4 w-4" />}
                Set owner password
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h2 className="text-lg font-semibold">Owner sign in</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Google sign-in and public registration are disabled for this portal.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} noValidate>
              <label className="block text-sm font-medium text-slate-700" htmlFor="owner-identifier">
                Username / Email
              </label>
              <input
                id="owner-identifier"
                className={inputClass}
                type="email"
                autoComplete="username"
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                required
                spellCheck={false}
              />

              <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="owner-login-password">
                Password
              </label>
              <input
                id="owner-login-password"
                className={inputClass}
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                maxLength={256}
                required
                placeholder="Enter your owner password"
              />

              <button className={buttonClass + " mt-5"} type="submit" disabled={busy || !loginPassword}>
                {busy ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <LockKeyhole aria-hidden="true" className="h-4 w-4" />}
                Sign in securely
              </button>
            </form>
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
            Private route • Server-side verification • No Google login
          </p>
        </footer>
      </div>
    </main>
  );
}
