import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Heart,
  IndianRupee,
  LockKeyhole,
  QrCode,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

interface SupportPageProps {
  onBack: () => void;
}

const SUPPORT_AMOUNTS = [49, 99, 299, 400] as const;
const UPI_ID = 'jaganmohanraodj@okicici';
const SUPPORT_URL = 'https://manofstudy.pages.dev/support/';

export const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'any'>(99);
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const effectiveAmount = useMemo(() => {
    if (selectedAmount === 'any') {
      const parsed = Number(customAmount);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
    }
    return selectedAmount;
  }, [selectedAmount, customAmount]);

  const upiIntent = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'MAN OF STUDY Developer',
      tn: 'Voluntary support for MAN OF STUDY',
      cu: 'INR',
    });
    if (effectiveAmount) params.set('am', String(effectiveAmount));
    return `upi://pay?${params.toString()}`;
  }, [effectiveAmount]);

  const qrCodeUrl = useMemo(
    () =>
      'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=' +
      encodeURIComponent(upiIntent),
    [upiIntent]
  );

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
    } catch {
      const input = document.createElement('input');
      input.value = UPI_ID;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const chooseAmount = (amount: number | 'any') => {
    setSelectedAmount(amount);
    if (amount !== 'any') setCustomAmount('');
  };

  return (
    <div className="min-h-screen bg-[var(--mos-page-bg)] text-[var(--mos-text-primary)] tech-grid-pattern-light">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Man of Study</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Support Man of Study
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-white shadow-2xl">
          <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.35fr_.65fr] gap-8 p-7 sm:p-10 lg:p-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                Student-built • Voluntary support
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
                Support Man of Study.
                <span className="block text-emerald-300">Keep student tools moving.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl">
                Man of Study is built to keep practical academic, admissions, scholarship and student utility tools accessible without a paywall.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">100% free for everyone</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Voluntary support</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Student project</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6 self-end">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">A simple promise</p>
              <p className="mt-3 text-xl sm:text-2xl font-black leading-tight">
                Your support is gratitude — not a subscription.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                The website will remain free for everyone, including students who never contribute.
              </p>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Server, title: 'Infrastructure', text: 'Hosting, deployment and practical platform costs.' },
            { icon: Sparkles, title: 'Student Tools', text: 'New utilities, improvements and useful features.' },
            { icon: Wrench, title: 'Maintenance', text: 'Testing, bug fixes and keeping the platform reliable.' },
            { icon: ShieldCheck, title: 'Data & Care', text: 'Counselling data curation and privacy-conscious development.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="mt-4 font-black text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.05fr_.95fr] gap-6 lg:gap-8 items-start">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Choose your support</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">Any amount, always voluntary.</h2>
              </div>
              <IndianRupee className="w-7 h-7 text-slate-300 shrink-0" />
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SUPPORT_AMOUNTS.map((amount) => {
                const active = selectedAmount === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => chooseAmount(amount)}
                    className={`rounded-2xl border px-4 py-4 text-center transition-all ${
                      active
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/15'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xl font-black">₹{amount}</span>
                    <span className="block mt-1 text-[10px] font-bold uppercase tracking-wider opacity-60">Voluntary</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => chooseAmount('any')}
              className={`mt-3 w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                selectedAmount === 'any'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="block text-base font-black">Any amount</span>
              <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">Choose the amount you personally wish to contribute.</span>
            </button>

            {selectedAmount === 'any' && (
              <div className="mt-3">
                <label htmlFor="custom-support-amount" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter amount (₹)
                </label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                  <input
                    id="custom-support-amount"
                    inputMode="numeric"
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter any amount"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-4">
              <p className="text-sm font-black text-slate-900 dark:text-white">This is not a subscription plan.</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                ఇది subscription plan కాదు. ఇది మీరు ఇష్టపూర్వకంగా చేసే ఒక చిన్న support అంతే. ఈ website ఎప్పటికీ అందరికీ free గానే ఉంటుంది. ఇది మీరు మాకు ఇచ్చే ఒక పెద్ద support. Thanks ❤️
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                This support does not unlock paid features or create a recurring subscription. Everyone can continue using Man of Study for free.
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Support securely</p>
                <h2 className="mt-2 text-2xl font-black">₹{effectiveAmount || 'Any amount'}</h2>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-5 flex justify-center rounded-2xl bg-white p-3 border border-slate-200">
              <img src={qrCodeUrl} alt="UPI QR code for supporting Man of Study" width={220} height={220} className="w-[190px] h-[190px] sm:w-[220px] sm:h-[220px] object-contain" loading="eager" />
            </div>

            <a
              href={upiIntent}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-3.5 px-4 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Support via UPI
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI ID</p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{UPI_ID}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <LockKeyhole className="w-3.5 h-3.5" />
              Direct UPI payment channel • No recurring subscription
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Where support helps</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">Keep the platform useful, not complicated.</h2>
          </div>
          <div className="mt-7 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Web hosting and deployment infrastructure',
              'AP/TG EAPCET data curation and maintenance',
              'Frontend development, testing and bug fixes',
              'New student utilities and educational resources',
            ].map((item, index) => (
              <div key={item} className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4">
                <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-400">0{index + 1}</span>
                <p className="mt-3 text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">Built by a student</p>
            <h2 className="mt-3 text-3xl font-black">Dunna Jagan Mohan Rao</h2>
            <p className="mt-2 text-blue-100 font-semibold">B.Tech CSE Student • Founder, Man of Study</p>
            <p className="mt-5 text-sm leading-relaxed text-blue-50/90">
              Man of Study began as a student-built project focused on making useful engineering, admissions, scholarship and academic resources easier to access in one place.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">A simple promise</p>
            <div className="mt-5 space-y-3">
              {[
                'No support payment is required to use the website.',
                'Support is voluntary and does not create a subscription.',
                'Students who never contribute will still have access to the platform.',
                'Support is intended to help the project continue developing and maintaining its tools.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Questions</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black">Support FAQ</h2>
          </div>
          <div>
            {[
              ['Is this a subscription?', 'No. Support is a one-time voluntary contribution. It does not create a recurring subscription or unlock paid features.'],
              ['Will Man of Study become paid for everyone?', 'No. The support page clearly states that the website remains free for everyone, including students who do not contribute.'],
              ['What does my support help with?', 'It can help with practical platform expenses such as hosting, maintenance, data curation, testing, development and new student utilities.'],
              ['Can I choose my own amount?', 'Yes. You can select ₹49, ₹99, ₹299, ₹400 or choose Any amount and enter the amount you personally wish to support.'],
            ].map(([question, answer], index) => (
              <div key={question} className="border-b last:border-b-0 border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between gap-4 text-left p-5 sm:px-8 hover:bg-slate-50 dark:hover:bg-slate-950/70 transition-colors"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">{question}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <p className="px-5 sm:px-8 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 p-7 sm:p-10 text-center">
          <Heart className="mx-auto w-8 h-8 text-rose-500 fill-rose-500" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-black">Thank you for supporting student-built education.</h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Your support is completely voluntary. The website remains free for everyone.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <a href={upiIntent} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-3 transition-colors">
              Support ₹{effectiveAmount || 'Any amount'}
              <ArrowRight className="w-4 h-4" />
            </a>
            <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Explore Man of Study
            </button>
          </div>
          <p className="mt-5 text-[11px] text-slate-400 dark:text-slate-500">{SUPPORT_URL}</p>
        </section>
      </main>
    </div>
  );
};

export default SupportPage;
