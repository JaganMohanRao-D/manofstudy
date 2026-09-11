import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Cookie, HelpCircle, ArrowLeft, Mail } from 'lucide-react';

export interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const supportEmail = 'support.jamord@gmail.com';

  return (
    <div id="privacy-policy-view" className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-200">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to App</span>
        </button>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% In-Memory Privacy Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Privacy Policy &amp; Data Protection Disclosures
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Effective Date: Academic Year 2026. Built with absolute respect for student confidentiality, local browser execution, and strict global data privacy standards (GDPR, CCPA, and India DPDP Act 2023).
        </p>
      </div>

      {/* Core Privacy Pillar Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Client-Side Sandbox
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All PDF merges, compressions, image resizings, and ATS resume tokenizations process exclusively in your device's browser memory (RAM / WebAssembly).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Zero File Uploads
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We operate zero backend database storage for user files. No student resumes, marksheets, or examination photos are ever transmitted to or stored on remote servers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            No PII Tracking
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We do not collect government Aadhaar numbers, biometric impressions, phone numbers, or academic credentials. You use JAVISAK anonymously.
          </p>
        </div>
      </div>

      {/* Comprehensive Policy Document */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            1. Introduction &amp; Core Operating Philosophy
          </h2>
          <p>
            JAVISAK (the "Platform", accessible at <a href="https://javisak.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">https://javisak.vercel.app</a> and preview mirrors) is an independent open-access educational operating system developed to assist engineering and degree scholars across Andhra Pradesh, Telangana, and broader India. We believe that privacy is a foundational human right. Unlike predatory commercial websites that upload sensitive resumes, mark sheets, and national ID cards to remote databases for monetization, JAVISAK is engineered with a strict <strong>client-side in-memory execution paradigm</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            2. Information We Do NOT Collect
          </h2>
          <p>
            When utilizing any feature across our suite—including the Attendance Defender, Global GPA Hub, Internal Exam Cutoff Estimator, 30+ PDF Power Tools, 20KB Exam Photo Resizer, and ATS Resume Analyzer:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>No Documents or Media:</strong> Your uploaded PDF files, images, photographs, resumes, and text documents remain strictly in your browser session memory. They are never transmitted over the internet to our servers.</li>
            <li><strong>No Biometric or Identity Numbers:</strong> We never request, capture, or log Aadhaar numbers, biometric fingerprints, iris scans, or hall ticket passwords.</li>
            <li><strong>No Academic Transcripts:</strong> Your internal test marks, semester grades, and attendance entries are processed via instantaneous JavaScript arithmetic in your local browser window.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. Browser Local Storage &amp; Session State
          </h2>
          <p>
            JAVISAK utilizes client-side <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 font-mono text-xs">localStorage</code> solely to save non-sensitive, convenience preferences across your visits. These settings include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>UI visual theme mode (Light Mode / Dark Mode).</li>
            <li>Active workspace selections and recently viewed branch roadmaps.</li>
            <li>Client-side checklist completion ticks for your personal DSA study plan.</li>
          </ul>
          <p>
            This data never leaves your browser device. You can purge all stored preferences at any time by clearing your browser cache or clicking "Clear Local Storage" in your browser developer settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cookie className="w-4 h-4 text-amber-500" />
            <span>4. Google AdSense &amp; Third-Party Advertising Cookies</span>
          </h2>
          <p>
            To keep JAVISAK 100% free forever for students without requiring subscription paywalls, this website may display advertisements served by Google AdSense and certified Google third-party advertising partners:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites across the internet.
            </li>
            <li>
              Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to JAVISAK and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-semibold"
              >
                Google Ads Settings
              </a>.
            </li>
            <li>
              Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-semibold"
              >
                aboutads.info
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            5. Anonymous Telemetry &amp; Hosting Infrastructure
          </h2>
          <p>
            Our web assets are served via secure Edge Content Delivery Networks (including Cloudflare Pages). These edge proxies may process non-personally identifiable server logs (such as IP addresses for DDoS mitigation, browser User-Agent strings, and latency metrics) to ensure rapid asset caching and defense against automated attacks. These logs are governed by the hosting provider's security policies and are purged on standard operational cycles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            6. Children’s Online Privacy Protection (COPPA / DPDP Compliance)
          </h2>
          <p>
            JAVISAK does not knowingly collect personal data from individuals under 13 years of age. All interactive utilities operate without user accounts, sign-ups, or login walls, ensuring full compliance with child safety and digital student privacy directives.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>7. Data Protection Officer &amp; Inquiries</span>
          </h2>
          <p>
            For questions, legal notices, or feedback concerning our privacy guarantees, contact our grievance desk directly at:
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-xs">Official Support &amp; Grievance Email</span>
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{supportEmail}</span>
            </div>
            <a
              href={`mailto:${supportEmail}?subject=Privacy%20Inquiry`}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              Contact Desk
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
