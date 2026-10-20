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
          <span>How We Handle Files and Data</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Privacy Policy &amp; Data Protection Disclosures
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Effective date: October 2026. This policy describes the current intended handling of information across Naa College features. Different tools may process information differently, including through third-party services.
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
            Many PDF merges, compressions, image resizings, and document utilities process in your browser. The Student Gap Analyzer may use an external AI service when that service is configured; review the feature before submitting personal information.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Browser-Based File Tools
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Many file utilities process files in your browser. The Student Gap Analyzer may send assessment inputs to an external AI service when configured. Avoid submitting sensitive documents, government identifiers, passwords, or unnecessary personal information. This statement does not mean that every feature operates entirely offline.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Data Minimisation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Avoid entering government ID numbers, biometric information, passwords, or other sensitive details into public tools. Some features require information to calculate results, and some AI-assisted features send submitted text to an external provider.
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
            NAA COLLEGE (the "Platform", accessible at <a href="https://naacollege.in" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">https://naacollege.in</a>) is an independent educational resource for students in Andhra Pradesh, Telangana, and across India. Many utility features process information in the browser, while collaborative, authentication, AI-assisted, and advertising features may involve third-party services as described in this policy. Review individual feature descriptions before submitting information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            2. How Features Process Information
          </h2>
          <p>
            When utilizing any feature across our suite—including the Attendance Defender, Global GPA Hub, Internal Exam Cutoff Estimator, 30+ PDF Power Tools, 20KB Exam Photo Resizer, and ATS Resume Analyzer:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li><strong>File processing:</strong> Many PDF and image utilities process files in your browser. The Student Gap Analyzer may use an external AI service when configured. Avoid entering sensitive information into AI-assisted features.</li>
            <li><strong>Sensitive information:</strong> Do not enter Aadhaar numbers, hall-ticket details, passwords, or other sensitive identifiers into tools unless the feature explicitly requires them and you understand how the information is processed.</li>
            <li><strong>Calculator inputs:</strong> Attendance and grade calculations generally run in the browser. The Student Gap Analyzer may send assessment inputs to an external AI service when configured; avoid submitting sensitive details.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. Browser Local Storage &amp; Session State
          </h2>
          <p>
            NAA COLLEGE uses browser <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 font-mono text-xs">localStorage</code> for some convenience preferences and browser-local feature state, which can include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>UI visual theme mode (Light Mode / Dark Mode).</li>
            <li>Active workspace selections and recently viewed branch roadmaps.</li>
            <li>Client-side checklist completion ticks for your personal DSA study plan.</li>
          </ul>
          <p>
            Browser-local preferences are stored on your device. Clearing site data in your browser removes local preferences; it does not delete information already sent to an external service or data handled by third-party providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cookie className="w-4 h-4 text-amber-500" />
            <span>4. Google AdSense &amp; Third-Party Advertising Cookies</span>
          </h2>
          <p>
            This website may display advertisements served by Google AdSense and third-party advertising partners. Depending on your settings and region, these services may use cookies or similar technologies:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites across the internet.
            </li>
            <li>
              Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to NAA COLLEGE and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
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
                className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
              >
                aboutads.info
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            5. Hosting Infrastructure &amp; Technical Logs
          </h2>
          <p>
            Our web assets may be served through hosting and edge-network providers, including Cloudflare Pages. These providers may process technical request data such as IP addresses, browser and device information, requested URLs, timestamps, and security signals to deliver the site, troubleshoot errors, and protect against abuse. An IP address should not automatically be treated as anonymous. The provider controls the relevant logs and retention practices; consult its current privacy documentation for details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            6. Children and Age-Appropriate Use
          </h2>
          <p>
            NAA COLLEGE is intended as an educational resource. Some collaborative features may use Firebase authentication, and the Student Gap Analyzer may send assessment inputs to an external AI service when configured. Do not provide personal information unless it is necessary for the feature and you understand how it is processed. This statement is not a certification of legal compliance.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>7. Privacy Questions &amp; Inquiries</span>
          </h2>
          <p>
            For questions, legal notices, or feedback about this policy, contact the site support address below:
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
