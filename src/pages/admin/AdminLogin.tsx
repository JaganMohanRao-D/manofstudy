import React, { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, LoaderCircle, AlertCircle } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLogin() {
  const { login, isAdmin, loading } = useAdminAuth();
  const [email, setEmail] = useState("jaganmakes@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Admin Sign In | Naa College";
    if (!loading && isAdmin) window.location.replace("/theone/dashboard");
  }, [isAdmin, loading]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      window.location.replace("/theone/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
      setPassword("");
    }
  }

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f4f6fa] px-4 py-8 text-slate-900 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#d7e0ef]/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#eadbb8]/55 blur-3xl" />
      <section className="relative z-10 w-full max-w-[430px] rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_80px_-34px_rgba(15,31,58,.3)] sm:p-10">
        <div className="flex flex-col items-center text-center">
          <img src="/Naa%20College%20logo.webp" alt="Naa College" width={92} height={92} className="h-[76px] w-[76px] object-contain sm:h-[88px] sm:w-[88px]" />
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e8dfc9] bg-[#fbf8f0] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#8c6824]">
            <ShieldCheck className="h-3.5 w-3.5" /> Private administrator access
          </span>
          <h1 className="mt-4 text-[28px] font-black tracking-tight text-[#14233d] sm:text-3xl">Admin Sign In</h1>
          <p className="mt-2 max-w-[290px] text-sm leading-6 text-slate-500">Sign in to manage Naa College content and website settings.</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={busy}>
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="admin-email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#b68b35] focus:ring-4 focus:ring-[#b68b35]/15 disabled:bg-slate-50" placeholder="Admin email" />
            </div>
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="admin-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-base text-slate-900 outline-none transition focus:border-[#b68b35] focus:ring-4 focus:ring-[#b68b35]/15 disabled:bg-slate-50" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 hover:text-[#8c6824] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68b35]">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium leading-5 text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

          <button type="submit" disabled={busy || loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#14233d] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1d3458] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b68b35]/25 disabled:cursor-not-allowed disabled:opacity-65">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            {busy ? "Verifying access…" : "Sign in to dashboard"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <p className="text-xs leading-5 text-slate-400">Restricted to the authorised Naa College administrator.</p>
          <a href="/" className="mt-3 inline-flex text-xs font-bold text-[#8c6824] underline-offset-4 hover:underline">Return to Naa College</a>
        </div>
      </section>
    </main>
  );
}
