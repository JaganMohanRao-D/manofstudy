import React, { useState } from 'react';
import { ShieldCheck, X, AlertCircle, Loader2, Sparkles, UserCheck, ExternalLink, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CampusAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, pendingAction, authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Auth succeeded; modal will close and the caller effect will trigger the pending action
      }
    } catch (err: any) {
      const msg = err?.message || '';
      const isCancellation =
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('closed-by-user') ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request';

      if (!isCancellation) {
        setErrorMessage(msg || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawError = errorMessage || authError;
  const isUnauthorizedDomain =
    rawError?.startsWith('UNAUTHORIZED_DOMAIN:') ||
    rawError?.toLowerCase().includes('unauthorized-domain') ||
    rawError?.toLowerCase().includes('authorized domains') ||
    rawError?.toLowerCase().includes('not authorized for google sign-in');

  const detectedDomain = isUnauthorizedDomain
    ? (rawError?.startsWith('UNAUTHORIZED_DOMAIN:')
        ? rawError.replace('UNAUTHORIZED_DOMAIN:', '')
        : (typeof window !== 'undefined' ? window.location.hostname : ''))
    : null;

  const actionLabel =
    pendingAction?.type === 'ask-doubt'
      ? 'Asking a Doubt'
      : pendingAction?.type === 'post-solution'
      ? 'Posting a Solution'
      : 'CampusConnect Access';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-pink-200/90 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-800 border border-pink-200">
              <Sparkles className="w-3 h-3 text-pink-600" />
              Verified Student Network
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Sign in to CampusConnect
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Use your Google Account to ask doubts and help other students.
            </p>
          </div>

          {/* Action indicator if triggered by an intent */}
          {pendingAction && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-pink-600" />
              <span>Continue to {actionLabel}</span>
            </div>
          )}
        </div>

        {/* Body & Google Action Button */}
        <div className="px-6 pb-6 sm:px-7 sm:pb-7 space-y-4">
          {rawError && (
            isUnauthorizedDomain ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-900 text-xs">Domain Authorization Required</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Google Sign-In is blocked by Firebase because this site domain is not yet on the authorized list.
                    </p>
                  </div>
                </div>

                {detectedDomain && (
                  <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Domain to add in Firebase:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(detectedDomain);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                      >
                        {copiedDomain ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block text-[11px] font-mono text-slate-900 break-all select-all bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {detectedDomain}
                    </code>
                  </div>
                )}

                <div className="text-[11px] text-amber-900/90 space-y-1">
                  <p className="font-semibold text-amber-900">How to authorize in Firebase Console:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-700 pl-0.5 text-[11px]">
                    <li>Open Firebase Console &gt; <span className="font-medium text-slate-800">Authentication</span></li>
                    <li>Go to <span className="font-medium text-slate-800">Settings &gt; Authorized domains</span></li>
                    <li>Click <span className="font-medium text-slate-800">&quot;Add domain&quot;</span> and paste the domain above</li>
                  </ol>
                </div>

                {window.self !== window.top && (
                  <div className="pt-1 border-t border-amber-200/60">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-700 hover:underline"
                    >
                      <span>Open app in new tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <span>{rawError}</span>
                  {window.self !== window.top && (
                    <div className="pt-1">
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:underline"
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
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                <span>Opening Google Sign-In...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privacy &amp; Accountability Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Google sign-in is required to keep CampusConnect accountable. You can choose to display your name or post publicly as <span className="font-semibold text-slate-700">Anonymous Student</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
