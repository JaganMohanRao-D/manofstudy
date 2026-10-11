import React, { useEffect, useState } from 'react';
import {
  X,
  Heart,
  Zap,
  Copy,
  Check,
  Share2,
  QrCode,
  Code2,
  Server,
  BookOpen,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';

export interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContributionTier {
  id: string;
  amount: number | null;
  label: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const CONTRIBUTION_TIERS: ContributionTier[] = [
  {
    id: 'tier-20',
    amount: 20,
    label: '₹20',
    category: 'Content & Research',
    description: 'Contributes toward data research, counseling analytics & student guides.',
    icon: BookOpen,
    tag: 'Research',
  },
  {
    id: 'tier-50',
    amount: 50,
    label: '₹50',
    category: 'Web Development',
    description: 'Helps support UI/UX design, frontend tools, testing & new features.',
    icon: Code2,
    tag: 'Dev & UI',
  },
  {
    id: 'tier-100',
    amount: 100,
    label: '₹100',
    category: 'Hosting & Server',
    description: 'Helps cover cloud hosting, data fetching pipelines & domain maintenance.',
    icon: Server,
    tag: 'Infrastructure',
  },
  {
    id: 'tier-any',
    amount: null,
    label: 'Any',
    category: 'Keep Naa College Growing',
    description: 'Voluntary contribution to help keep NAA COLLEGE available and updated.',
    icon: Sparkles,
    tag: 'Open Support',
  },
];

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('tier-50');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const [isToolResultPrompt, setIsToolResultPrompt] = useState<boolean>(false);

  const PLATFORM_URL = 'https://naacollege.in/';
  const UPI_ID = 'jaganmohanraodj@okicici';

  const selectedTier =
    CONTRIBUTION_TIERS.find((t) => t.id === selectedTierId) || CONTRIBUTION_TIERS[1];

  const upiIntentUri = selectedTier.amount
    ? `upi://pay?pa=${UPI_ID}&pn=MAN%20OF%20STUDY%20Developer&tn=Support%20for%20MAN%20OF%20STUDY&am=${selectedTier.amount}&cu=INR`
    : `upi://pay?pa=${UPI_ID}&pn=MAN%20OF%20STUDY%20Developer&tn=Support%20for%20MAN%20OF%20STUDY`;

  const qrCodeUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=' +
    encodeURIComponent(upiIntentUri);

  const handleClose = () => {
    try {
      sessionStorage.removeItem('mos_support_prompt_v1');
    } catch {
      // Storage restrictions must never break the application.
    }
    onClose();
  };

  const openFullSupportPage = () => {
    try {
      sessionStorage.removeItem('mos_support_prompt_v1');
    } catch {
      // Ignore storage restrictions.
    }
    window.location.assign('/support/');
  };

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2200);
    } catch {
      const tempInput = document.createElement('input');
      tempInput.value = UPI_ID;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2200);
    }
  };

  const handleCopyPlatformUrl = async () => {
    try {
      await navigator.clipboard.writeText(PLATFORM_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      const tempInput = document.createElement('input');
      tempInput.value = PLATFORM_URL;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let resultPrompt = false;
    try {
      resultPrompt = sessionStorage.getItem('mos_support_prompt_v1') === 'shown';
    } catch {
      resultPrompt = false;
    }

    setIsToolResultPrompt(resultPrompt);

    // Header/footer/command-palette Support buttons use the existing modal callback.
    // Those entry points should now go directly to the dedicated support page.
    if (!resultPrompt) {
      window.location.assign('/support/');
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || !isToolResultPrompt) return null;

  return (
    <div
      id="support-donation-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        id="support-donation-modal-card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-left overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        <button
          type="button"
          id="close-support-modal-btn"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close Support Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pr-8 mb-3">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
              <span>Independent Student Project</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Free Student Tools
            </span>
          </div>

          <h2 id="support-modal-title" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Support NAA COLLEGE Development
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Every dataset, rank predictor, and student tool on this platform is built independently. Voluntary contributions help cover practical technical costs.
          </p>

          <button
            type="button"
            onClick={openFullSupportPage}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            See full support details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5 overflow-y-auto pr-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Contribution Purpose
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedTier.amount ? `Selected: ₹${selectedTier.amount}` : 'Flexible amount'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONTRIBUTION_TIERS.map((tier) => {
                const IconComponent = tier.icon;
                const isSelected = selectedTierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                        {tier.label}
                      </span>
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    </div>
                    <div className={`text-[11px] font-bold leading-tight truncate ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-300'}`}>
                      {tier.category}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2">
              <div className="p-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                {React.createElement(selectedTier.icon, { className: 'w-3.5 h-3.5' })}
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 mr-1.5">{selectedTier.category}:</span>
                <span className="text-slate-600 dark:text-slate-300">{selectedTier.description}</span>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3.5">
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="p-1.5 bg-white rounded-xl shadow-sm border border-slate-200">
                <img src={qrCodeUrl} alt={`UPI QR Code for ${selectedTier.amount ? '₹' + selectedTier.amount : 'Support'}`} width={112} height={112} className="rounded-lg object-contain" loading="lazy" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <QrCode className="w-2.5 h-2.5" /> GPay / PhonePe / Paytm
              </span>
            </div>

            <div className="flex-1 w-full space-y-2">
              <a
                id="mobile-direct-upi-launch-btn"
                href={upiIntentUri}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl w-full flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer text-xs sm:text-sm text-center"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
                <span>{selectedTier.amount ? `Pay ₹${selectedTier.amount} via Any UPI App` : 'Support via Any UPI App'}</span>
              </a>

              <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Verified Payment Channel</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-xs truncate flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Direct UPI · Student Platform Support</span>
                  </span>
                </div>
                <button type="button" onClick={handleCopyUpiId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors cursor-pointer shrink-0" aria-label="Copy UPI Payment Address">
                  {copiedUpi ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Copied</span></> : <><Copy className="w-3 h-3 text-slate-500" /><span>Copy UPI VPA</span></>}
                </button>
              </div>

              <p className="text-[10.5px] text-rose-700 dark:text-rose-300 font-semibold text-center sm:text-left leading-tight">
                మా website మీకు ఉపయోగపడితే, మీ ఇష్టపూర్వకంగా support చేయవచ్చు. ❤️
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <button type="button" onClick={() => setShowTechDetails(!showTechDetails)} className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
              <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-emerald-500" />How contributions help support this project</span>
              <span className="text-[11px] text-slate-400 font-normal">{showTechDetails ? 'Hide' : 'View details'}</span>
            </button>
            {showTechDetails && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                <p className="text-slate-700 dark:text-slate-300 font-medium">Voluntary support can help cover practical engineering &amp; operational expenses:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px]">
                  <div>• Web hosting &amp; server infrastructure</div>
                  <div>• Domain registration &amp; renewal</div>
                  <div>• AP/TG EAPCET counseling data curation</div>
                  <div>• UI/UX &amp; frontend feature development</div>
                  <div>• Testing, bug fixes &amp; maintenance</div>
                  <div>• Keeping tools available and updated</div>
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block truncate">Share with classmates &amp; peers</span>
              <span className="text-[10px] text-slate-400 truncate block">naacollege.in</span>
            </div>
            <button type="button" onClick={handleCopyPlatformUrl} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer shadow-sm">
              {copiedUrl ? <><Check className="w-3 h-3" /><span>Copied!</span></> : <><Share2 className="w-3 h-3" /><span>Share Link</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
