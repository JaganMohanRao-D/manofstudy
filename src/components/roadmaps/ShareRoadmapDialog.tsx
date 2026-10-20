import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Linkedin,
  Twitter,
  ExternalLink,
} from 'lucide-react';
import { BranchRoadmap } from '../../types';

interface ShareRoadmapDialogProps {
  branch: BranchRoadmap;
  onClose: () => void;
}

export const ShareRoadmapDialog: React.FC<ShareRoadmapDialogProps> = ({
  branch,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState(false);

  // Generate branch deep link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/#roadmap-${branch.id}`;

  const shareText = `Check out the comprehensive 4-Year Engineering Roadmap for ${branch.name} (${branch.code}) on Naa College! Includes semester subjects, lab skills, certifications, open-source projects, and placement prep.`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText}\n\n👉 Access Roadmap: ${shareUrl}`
    )}`;
    window.open(url, '_blank');
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${branch.name} 4-Year Roadmap | Naa College`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  // Close handler with state reset
  const handleClose = () => {
    onClose();
  };

  return (
    <div
      id="share-roadmap-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--mos-overlay)] backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
      }}
      tabIndex={-1}
    >
      {/* 1. Backdrop Touch Dismissal Layer */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={handleClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleClose();
        }}
        role="button"
        tabIndex={-1}
        aria-label="Dismiss share dialog overlay"
      />

      {/* 2. Dialog Container */}
      <div
        id="share-roadmap-dialog"
        className="relative z-10 w-full max-w-lg bg-[var(--mos-surface)] text-[var(--mos-text-primary)] rounded-2xl shadow-2xl border border-[var(--mos-border)] overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--mos-surface-muted)] text-[var(--mos-text-primary)] p-5 flex items-start justify-between gap-3 border-b border-[var(--mos-border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {branch.code}
              </span>
              <span className="text-xs font-semibold text-[var(--mos-text-secondary)]">
                {branch.categoryLabel}
              </span>
            </div>
            <h3
              id="share-dialog-title"
              className="text-lg sm:text-xl font-black tracking-tight text-[var(--mos-text-primary)] flex items-center gap-2"
            >
              <Share2 className="w-5 h-5 text-blue-500" />
              <span>Share this Roadmap</span>
            </h3>
            <p className="text-xs text-[var(--mos-text-secondary)] line-clamp-1">
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
            className="p-2 rounded-xl bg-[var(--mos-surface)] hover:bg-rose-500/10 hover:text-rose-500 active:scale-95 text-[var(--mos-text-secondary)] transition-all border border-[var(--mos-border)] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
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
              className="text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider block"
            >
              Direct Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--mos-input-bg)] border border-[var(--mos-input-border)] text-[var(--mos-text-primary)] select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Link copied to clipboard! You can paste it into chats or study groups.</span>
              </p>
            )}

            {/* Copy Platform Main URL */}
            <div className="pt-2 flex items-center justify-between border-t border-[var(--mos-border)]">
              <span className="text-xs text-[var(--mos-text-muted)] font-medium">Platform URL:</span>
              <button
                type="button"
                id="copy-platform-url-btn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText('https://naacollege.in/');
                    setCopiedPlatform(true);
                    setTimeout(() => setCopiedPlatform(false), 2500);
                  } catch {
                    // Fallback
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] text-[var(--mos-text-secondary)] hover:text-[var(--mos-text-primary)] text-xs font-semibold cursor-pointer transition-colors border border-[var(--mos-border)]"
                title="Copy Platform URL"
              >
                {copiedPlatform ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Link copied to clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--mos-text-muted)]" />
                    <span>Copy Platform URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[var(--mos-text-secondary)] uppercase tracking-wider block">
              Share With Batchmates
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleLinkedIn}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                <Linkedin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>LinkedIn</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleTwitter}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--mos-surface-muted)] hover:bg-[var(--mos-border)] active:scale-95 text-[var(--mos-text-primary)] border border-[var(--mos-border)] text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                <Twitter className="w-4 h-4 text-[var(--mos-text-muted)]" />
                <span>Twitter (X)</span>
              </button>
            </div>
          </div>

          {/* Native Web Share Option if supported on mobile/tablet */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-95 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
            >
              <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Open System Share Sheet</span>
            </button>
          )}
        </div>

        {/* Footer with definitive "Done" dismissal */}
        <div className="bg-[var(--mos-surface-muted)] border-t border-[var(--mos-border)] p-4 flex items-center justify-end gap-3">
          <button
            id="share-dialog-done-btn"
            type="button"
            onClick={handleClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--mos-text-primary)] hover:opacity-90 active:scale-95 text-[var(--mos-page-bg)] font-bold text-xs shadow-xs transition-all cursor-pointer min-h-[42px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareRoadmapDialog;
