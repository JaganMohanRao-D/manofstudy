import React, { useEffect } from 'react';
import { X, Heart, Sparkles, ShieldCheck, Zap, Coffee } from 'lucide-react';

export interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
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

  // Dynamic encrypted UPI intent link with payment note pre-filled
  const upiIntentUri =
    'upi://pay?pa=7842587883@ybl&pn=StudyMacha%20Developer&tn=A%20kind%20support%20and%20gratitude%20for%20StudyMacha';

  // Fast dynamic QR Code from reliable server generator
  const qrCodeUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi%3A%2F%2Fpay%3Fpa%3D7842587883%40ybl%26pn%3DStudyMacha%2520Developer%26tn%3DA%2520kind%2520support%2520and%2520gratitude%2520for%2520StudyMacha';

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
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 relative text-center overflow-hidden max-h-[92vh] overflow-y-auto"
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
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3"
        >
          Help Us Keep StudyMacha{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 dark:from-rose-400 dark:via-pink-400 dark:to-amber-400">
            100% Free Forever
          </span>
        </h2>

        {/* Emotional Narrative Storyline */}
        <div className="space-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed text-left bg-slate-50/90 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/70 mb-5">
          <p>
            StudyMacha started with zero budget from a hostel room to rescue thousands of Telugu students from entrance confusion, attendance panic, and expensive ed-tech traps.
          </p>
          <p>
            We host everything with <strong>zero paywalls, zero sketchy ads, and 100% student privacy</strong>. But running high-speed servers, radar scrapers, and database tools costs real money every month.
          </p>
          <p className="text-rose-700 dark:text-rose-300 font-medium">
            Even a small contribution of ₹10, ₹20, or a cup of chai (₹50) directly helps us pay server bills and keep this platform alive and free for every rural &amp; college student. Your kindness fuels our code.
          </p>
        </div>

        {/* Suggested Micro-Pills */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap mb-4">
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
        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-4">
          {/* Dynamic Fast QR Code Showcase Container */}
          <div className="relative p-2 bg-white rounded-xl shadow-xs border border-slate-200/90">
            <img
              src={qrCodeUrl}
              alt="Scan to Donate &amp; Support StudyMacha via UPI"
              width={190}
              height={190}
              className="rounded-lg object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* Center UPI Mini Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-[280px]">
            Scan with <strong>PhonePe, Google Pay, Paytm, BHIM</strong> or any UPI App to contribute custom amount.
          </p>
        </div>

        {/* MOBILE DEVICES (DIRECT 1-CLICK UPI APP LAUNCH) */}
        <div className="mb-4">
          <a
            id="mobile-direct-upi-launch-btn"
            href={upiIntentUri}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold py-3 px-5 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
            <span>Pay via Any UPI App (PhonePe / GPay / Paytm / BHIM)</span>
          </a>
          <p className="text-[10px] text-slate-400 mt-1.5 sm:hidden">
            (Tap above to directly open your installed UPI app)
          </p>
        </div>

        {/* TRUST & GRATITUDE FOOTER */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>100% Secure Peer-to-Peer UPI Payment. You choose any amount in your app.</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            No intermediaries • No extra commissions • Directly fuels platform bandwidth &amp; scrapers
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
