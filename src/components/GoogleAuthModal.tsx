import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GoogleAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    authError,
    pendingAction,
  } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setLocalError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to sign in with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawError = localError || authError;
  const isUnauthorizedDomain =
    rawError &&
    (rawError.includes('auth/unauthorized-domain') ||
      rawError.includes('unauthorized domain') ||
      rawError.includes('not authorized'));

  const detectedDomain =
    typeof window !== 'undefined' ? window.location.hostname : '';

  const actionLabel =
    pendingAction?.type === 'mock-test'
      ? 'Mock Test Access'
      : 'Google Sign-In';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--mos-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[var(--mos-surface)] border border-[var(--mos-border)] text-[var(--mos-text-primary)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-[var(--mos-text-muted)] hover:text-[var(--mos-text-primary)] p-1.5 rounded-lg hover:bg-[var(--mos-surface-muted)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20">
              <Sparkles className="w-3 h-3 text-pink-500" />
              Verified Google Sign-In
            </span>
            <h2 className="text-xl font-extrabold text-[var(--mos-text-primary)] tracking-tight">
              Sign in to Naa College
            </h2>
            <p className="text-xs text-[var(--mos-text-secondary)] leading-relaxed max-w-xs mx-auto">
              Use your Google Account to continue to the Naa College Mock Test Series.
            </p>
          </div>

          {/* Action indicator if triggered by an intent */}
          {pendingAction && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] rounded-lg text-xs font-semibold text-[var(--mos-text-secondary)]">
              <UserCheck className="w-3.5 h-3.5 text-pink-500" />
              <span>Continue to {actionLabel}</span>
            </div>
          )}
        </div>

        {/* Body & Google Action Button */}
        <div className="px-6 pb-6 sm:px-7 sm:pb-7 space-y-4">
          {rawError && (
            isUnauthorizedDomain ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-900 dark:text-amber-100 text-xs">Domain Authorization Required</p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                      Google Sign-In is blocked by Firebase because this site domain is not yet on the authorized list.
                    </p>
                  </div>
                </div>

                {detectedDomain && (
                  <div className="bg-[var(--mos-surface)] p-2.5 rounded-lg border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mos-text-muted)]">
                        Domain to add in Firebase:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(detectedDomain);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 transition-colors cursor-pointer"
                      >
                        {copiedDomain ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Domain</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block text-xs font-mono font-bold text-amber-700 dark:text-amber-300 break-all">
                      {detectedDomain}
                    </code>
                  </div>
                )}

                <div className="text-[11px] text-amber-800/90 dark:text-amber-200/90 leading-normal space-y-1">
                  <p>
                    <strong>How to fix:</strong> Open Firebase Console → Authentication → Settings → Authorized domains → Add <code>{detectedDomain}</code>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Authentication Notice</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">{rawError}</p>
                <div className="pt-1 text-[11px] text-slate-500">
                  <span>If popup was blocked, please enable popups for this site.</span>
                  {window.self !== window.top && (
                    <div className="pt-1">
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                      >
                        <span>Open app in new tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-surface)] hover:bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                <span>Opening Google Sign-In...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Privacy and Verification Explanation Note */}
          <div className="p-3.5 rounded-xl bg-[var(--mos-surface-muted)] border border-[var(--mos-border)] text-[var(--mos-text-secondary)] text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[var(--mos-text-primary)] text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Sign-In</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--mos-text-muted)]">
              Google sign-in is required before starting a mock test. Your signed-in Google name and profile picture are used only to personalize the mock-test experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
