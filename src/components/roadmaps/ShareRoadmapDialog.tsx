import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Copy, Check, X, MessageCircle, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { BranchRoadmap } from '../../types';

export interface ShareRoadmapDialogProps {
  branch: BranchRoadmap;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareRoadmapDialog: React.FC<ShareRoadmapDialogProps> = ({
  branch,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Generate shareable URL for this specific branch
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#branch=${branch.id}`
    : `https://studymacha.pages.dev/#branch=${branch.id}`;

  const shareTitle = `${branch.name} (${branch.code}) 4-Year Career Roadmap • StudyMacha`;
  const shareText = `Explore the official 4-Year ${branch.name} Engineering Roadmap on StudyMacha with core subjects, industry skills, and salary benchmarks.`;

  // Explicit, safe close handler that ensures immediate cleanup of overlays
  const handleClose = useCallback(() => {
    onClose();

    // DOM cleanup safeguard to prevent any residual dimmer loops
    setTimeout(() => {
      const residualDimmers = document.querySelectorAll('#share-dialog-dimmer, #share-dialog-backdrop');
      residualDimmers.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }, 50);
  }, [onClose]);

  // Global keydown listener for immediate 'Escape' key dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const input = document.getElementById('share-url-input') as HTMLInputElement | null;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        handleClose();
      } catch {
        // User cancelled or share failed, stay open without crash
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="share-roadmap-modal-root"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="region"
      aria-label="Share dialog modal overlay"
    >
      {/* 1. Strict Background Dimmer Overlay with direct Click & TouchEnd listener */}
      <div
        id="share-dialog-dimmer"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer z-0 transition-opacity animate-in fade-in duration-150"
        onClick={handleClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleClose();
        }}
        aria-label="Dismiss share dialog overlay"
      />

      {/* 2. Dialog Container */}
      <div
        id="share-roadmap-dialog"
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {branch.code}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {branch.categoryLabel}
              </span>
            </div>
            <h3
              id="share-dialog-title"
              className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2"
            >
              <Share2 className="w-5 h-5 text-indigo-400" />
              <span>Share this Roadmap</span>
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1">
              {branch.name}
            </p>
          </div>

          {/* Close 'X' Button with explicit touch support */}
          <button
            id="share-dialog-close-btn"
            type="button"
            onClick={handleClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleClose();
            }}
            title="Close dialog (Esc)"
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 active:scale-95 text-slate-200 hover:text-white transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Copy Link Bar */}
          <div className="space-y-2">
            <label
              htmlFor="share-url-input"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Direct Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                id="share-copy-link-btn"
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer min-h-[42px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Link copied to clipboard! You can paste it into chats or study groups.</span>
              </p>
            )}
          </div>

          {/* Social Share Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Share With Batchmates
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 active:scale-95 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleLinkedIn}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/90 active:scale-95 text-sky-700 border border-sky-200 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                <Linkedin className="w-4 h-4 text-sky-600" />
                <span>LinkedIn</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleTwitter}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 active:scale-95 text-slate-800 border border-slate-300 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                <Twitter className="w-4 h-4 text-slate-700" />
                <span>Twitter (X)</span>
              </button>
            </div>
          </div>

          {/* Native Web Share Option if supported on mobile/tablet */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
            >
              <ExternalLink className="w-4 h-4 text-indigo-600" />
              <span>Open System Share Sheet</span>
            </button>
          )}
        </div>

        {/* Footer with definitive "Done" dismissal */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end gap-3">
          <button
            id="share-dialog-done-btn"
            type="button"
            onClick={handleClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer min-h-[42px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareRoadmapDialog;
