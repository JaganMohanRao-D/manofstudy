import React, { useEffect, useState } from 'react';
import { X, Heart, ShieldCheck, Zap, Coffee, Copy, Check, Share2, QrCode } from 'lucide-react';

export interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const PLATFORM_URL = 'https://manofstudy.pages.dev';

  const handleCopyPlatformUrl = async () => {
    try {
      await navigator.clipboard.writeText(PLATFORM_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback
      const tempInput = document.createElement('input');
      tempInput.value = PLATFORM_URL;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Close on ESC key and prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // UPI intent URI. The user reviews the payment in their own UPI app before confirming.
  const upiIntentUri =
    'upi://pay?pa=7842587883@ybl&pn=MAN%20OF%20STUDY%20Developer&tn=A%20kind%20support%20and%20gratitude%20for%20MAN%20OF%20STUDY';

  // Generate the QR from the exact same URI used by the mobile button.
  const qrCodeUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=' +
    encodeURIComponent(upiIntentUri);

  return (
    <div
      id="support-donation-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      {/* Modal Card Container */}
      <div
        id="support-donation-modal-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 relative text-center overflow-hidden max-h-[calc(100dvh-20px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Warm Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-rose-500/10 blur-xl pointer-events-none" />

        {/* Close Button (X) */}
        <button
          type="button"
          id="close-support-modal-btn"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close Support Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emotional Badge */}
        <div className="flex justify-center mt-1 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/70 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>Built by Students, For Students</span>
          </span>
        </div>

        {/* Title */}
        <h2
          id="support-modal-title"
          className="text-[17px] sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 sm:mb-3 px-5"
        >
          If MAN OF STUDY genuinely helped you, you can support its journey
        </h2>

        {/* Emotional Narrative Storyline */}
        <div className="space-y-1.5 sm:space-y-2.5 text-[10.5px] sm:text-[13px] text-slate-600 dark:text-slate-300 leading-[1.35] sm:leading-relaxed text-left bg-slate-50/90 dark:bg-slate-800/40 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800/70 mb-2.5 sm:mb-5">
          <p>
            <strong>Thank you for using MAN OF STUDY.</strong> This platform is being built with a simple goal: make useful student information and practical tools available to students and parents without putting the important parts behind a paywall.
          </p>
          <p>
            If a tool here genuinely saved you time, reduced some confusion, or helped you understand your options, your support can help us keep improving the platform and continue making these resources available to more students.
          </p>
          <p className="text-rose-700 dark:text-rose-300 font-semibold">
            మీకు మా website నిజంగా helpful గా అనిపిస్తే, మీకు నచ్చినంత support చేయండి. మీ చిన్న సహాయం కూడా ఇలాంటి information ని మరింత మంది students &amp; parents కి free గా అందించడానికి ఉపయోగపడుతుంది. ❤️
          </p>
        </div>

        {/* Suggested Micro-Pills */}
        <div className="hidden sm:flex items-center justify-center gap-1.5 flex-wrap mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
            <Coffee className="w-3 h-3 text-amber-600" /> ₹20 Chai
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
            🍛 ₹50 Samosa &amp; Meal
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50">
            💻 ₹100 Server Fuel
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
            ✨ Any Amount
          </span>
        </div>

        {/* LAPTOP & DESKTOP (SCAN & PAY VIA DYNAMIC QR) */}
        <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-4">
          {/* Dynamic Fast QR Code Showcase Container */}
          <div className="relative p-2 bg-white rounded-xl shadow-xs border border-slate-200/90">
            <img
              src={qrCodeUrl}
              alt="Scan to Donate &amp; Support MAN OF STUDY via UPI"
              width={190}
              height={190}
              className="rounded-lg object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <QrCode className="w-3.5 h-3.5" /> UPI QR · scan with any supported UPI app
            </div>
          </div>

          <p className="mt-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-[280px]">
            Scan with your preferred UPI app. The payment app will show the details before you confirm.
          </p>
        </div>

        {/* MOBILE DEVICES (DIRECT 1-CLICK UPI APP LAUNCH) */}
        <div className="mb-2.5 sm:mb-4">
          <a
            id="mobile-direct-upi-launch-btn"
            href={upiIntentUri}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
            <span>Support Now · Open UPI App</span>
          </a>
          <p className="hidden sm:block text-[10px] text-slate-400 mt-1.5">
            (Your UPI app will open; review the payment before confirming.)
          </p>
        </div>

        {/* SHARE PLATFORM */}
        <div className="mb-2.5 sm:mb-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 text-left">
              <p className="text-[10.5px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">Share MAN OF STUDY with your friends</p>
              <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5 break-all">manofstudy.pages.dev</p>
            </div>
            <button type="button" id="share-platform-url-btn" onClick={handleCopyPlatformUrl} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] sm:text-xs shadow-sm transition-all cursor-pointer shrink-0">
              {copiedUrl ? <><Check className="w-3.5 h-3.5" /><span>Copied!</span></> : <><Share2 className="w-3.5 h-3.5" /><span>Share</span></>}
            </button>
          </div>
        </div>
        {/* TRUST & GRATITUDE FOOTER */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5 sm:space-y-1 text-slate-500 dark:text-slate-400">
          <div className="hidden sm:flex items-center justify-center gap-1.5 text-[11px] font-medium" text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Direct UPI intent · You choose the amount and confirm it in your own UPI app.</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Thank you for helping us keep useful student resources accessible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
