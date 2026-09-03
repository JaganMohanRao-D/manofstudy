import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Info,
  Scale,
  AlertCircle,
} from 'lucide-react';

export type LegalModalType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer';

interface LegalModalsProps {
  type: LegalModalType | null;
  onClose: () => void;
  onSwitchType?: (type: LegalModalType) => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  type,
  onClose,
  onSwitchType,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactSubject, setContactSubject] = useState('Feedback & Inquiries');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSender, setContactSender] = useState('');
  const [contactSent, setContactSent] = useState(false);

  if (!type) return null;

  const supportEmail = 'support.jamord@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
      `[StudyMacha ${contactSubject}] from ${contactSender || 'User'}`
    )}&body=${encodeURIComponent(contactMessage)}`;
    window.location.href = mailtoUrl;
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200 shrink-0">
              {type === 'about' && <Sparkles className="w-5 h-5" />}
              {type === 'contact' && <Mail className="w-5 h-5" />}
              {type === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {type === 'terms' && <Scale className="w-5 h-5" />}
              {type === 'disclaimer' && <Info className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 capitalize">
                {type === 'about' && 'About StudyMacha'}
                {type === 'contact' && 'Contact Support Team'}
                {type === 'privacy' && 'Privacy Policy'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'disclaimer' && 'Academic & Counselling Disclaimer'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official StudyMacha Institutional &amp; Compliance Information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Modal Switcher Tabs */}
        {onSwitchType && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs shrink-0 border-b border-slate-100">
            {(
              [
                { id: 'about', label: 'About Us' },
                { id: 'contact', label: 'Contact Us' },
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'terms', label: 'Terms & Conditions' },
                { id: 'disclaimer', label: 'Disclaimer' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSwitchType(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  type === tab.id
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="space-y-5 text-xs text-slate-600 leading-relaxed overflow-y-auto pr-1 flex-1">
          {/* ABOUT US */}
          {type === 'about' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 text-sky-950">
                <h3 className="font-bold text-sm text-sky-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Our Mission: High-Performance, Private Utilities for All
                </h3>
                <p>
                  StudyMacha was created to dismantle the frustrating landscape of clunky, ad-saturated, and privacy-invasive web utilities. Whether you are an engineer optimizing your ATS resume for international tech roles, a researcher compressing publication PDFs, or an Indian student navigating complex AP EAPCET counselling cutoffs and JNTU/VTU attendance thresholds, StudyMacha provides clean, lightning-fast tools that respect your time and data.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>100% In-Memory Architecture</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Unlike standard web services that upload your PDFs, photos, and resumes to remote servers, StudyMacha executes all operations directly in your browser's WebAssembly and JavaScript environment. Zero server uploads.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <Scale className="w-4 h-4 text-sky-600" />
                    <span>Global &amp; Regional Relevance</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Engineered to meet international document standards (ISO PDF/A, 16:9 slides, standard ATS parsing) while offering tailored precision for Indian engineering universities and government exam portals (GATE, UPSC, SSC).
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">Key Product Suites</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>PDF Power Suite:</strong> 30 standalone tools spanning conversion, page manipulation, security, and document optimization.</li>
                  <li><strong>Career &amp; ATS Suite:</strong> Client-side PDF/DOCX resume keyword analyzer and 1-click ATS-ready resume compiler.</li>
                  <li><strong>Exam Document Engine:</strong> Dynamic KB compressor and DPI resizer for exam registrations.</li>
                  <li><strong>AP EAPCET Vacancy Radar:</strong> Phase 2 seat allotment matrix and institutional leftover vacancy scanner.</li>
                  <li><strong>Academic Computation Core:</strong> University-accurate Attendance Defender and Multi-Board GPA/Percentage Hub.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-slate-900 block">Direct Inquiries &amp; Support</span>
                  <span className="text-slate-500 text-[11px]">Have feedback, bug reports, or partnership proposals?</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-medium text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-300 select-all">
                    {supportEmail}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                    title="Copy email address"
                  >
                    {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT US */}
          {type === 'contact' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-600" />
                    Official Support Desk
                  </span>
                  <p className="text-[11px] text-slate-500">
                    We welcome student feedback, institution correction notices, bug discoveries, and feature requests.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {supportEmail}
                  </a>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Direct Mail Form */}
              <form onSubmit={handleSendContact} className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Compose Message (Opens in your email client)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Your Name / College</label>
                    <input
                      type="text"
                      value={contactSender}
                      onChange={(e) => setContactSender(e.target.value)}
                      placeholder="e.g. Rahul Sharma, JNTUK"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Inquiry Category</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="AP EAPCET Vacancy Data Update">AP EAPCET Vacancy Data Update</option>
                      <option value="Bug Report / Tool Malfunction">Bug Report / Tool Malfunction</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Academic Formula Correction">Academic Formula Correction</option>
                      <option value="General Support">General Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your question, request, or issue..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Typical response timeframe: Within 24-48 business hours.
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {contactSent ? 'Draft Prepared!' : 'Send via Email'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PRIVACY POLICY (AdSense & GDPR Compliant) */}
          {type === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Core Privacy Promise: Zero-Server File Transfer</h4>
                  <p className="text-[11px] mt-0.5">
                    StudyMacha enforces an in-memory client-side execution model. When you upload PDFs, images, resumes, or text, they are manipulated exclusively inside your computer or mobile device's RAM and WebAssembly context. None of your files or documents are ever uploaded to, viewed by, or saved on our servers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Information We Do Not Collect</h4>
                <p>
                  We do not collect, view, or retain any user documents, resumes, images, grades, attendance logs, or personally identifiable academic transcripts. Once you close or reload the browser tab, the temporary memory buffer is completely flushed.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Local Storage and Client Preferences</h4>
                <p>
                  Certain non-sensitive user preferences (such as selected theme modes or active tab preferences) may be retained locally in your browser's <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">localStorage</code>. You may clear your browser cache at any time to purge these settings.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Google AdSense &amp; Third-Party Cookies</h4>
                <p>
                  This site may display advertisements served by Google AdSense and its certified advertising partners. Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to StudyMacha and/or other sites on the Internet.
                </p>
                <p>
                  Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 underline hover:text-sky-700"
                  >
                    Google Ads Settings
                  </a>. Alternatively, you can opt out of third-party vendors' use of cookies for personalized advertising by visiting{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 underline hover:text-sky-700"
                  >
                    aboutads.info
                  </a>.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">4. Web Analytics &amp; Performance Logging</h4>
                <p>
                  We may utilize privacy-preserving, aggregated telemetry tools to monitor platform availability, page load speeds, and error rates (e.g. Cloudflare Pages Web Analytics). These logs record strictly anonymous metrics (such as browser user-agent and screen resolution) and do not contain personal identifiers.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">5. Contact Regarding Privacy</h4>
                <p>
                  For any inquiries regarding this Privacy Policy or compliance with international data standards (GDPR, CCPA, and India's Digital Personal Data Protection Act 2023), please contact us directly at{' '}
                  <a href={`mailto:${supportEmail}`} className="text-sky-600 font-semibold underline">
                    {supportEmail}
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {type === 'terms' && (
            <div className="space-y-4">
              <p>
                Welcome to StudyMacha. By accessing or using this website, you agree to be bound by the following terms and conditions. If you do not agree with any part of these terms, please do not use the platform.
              </p>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. Acceptable Educational &amp; Professional Use</h4>
                <p>
                  StudyMacha provides productivity, document manipulation, and calculation utilities for personal, educational, and non-commercial professional use. You agree not to use the service to process unlawful, defamatory, infringing, or malicious content.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Client-Side Software Guarantee &amp; Availability</h4>
                <p>
                  While StudyMacha strives for 99.9% platform uptime and tests algorithms against official university frameworks, all utilities are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Intellectual Property</h4>
                <p>
                  All platform interfaces, proprietary computation engines, brand styling, visual designs, and source code are the intellectual property of StudyMacha. You retain complete ownership of all files, documents, and content processed using our client-side tools.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">4. Safe Harbor, Admissions &amp; Scholarship Disclaimer</h4>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs leading-relaxed">
                  <strong>Disclaimer:</strong> StudyMacha is an independent informational and utility platform. AP EAPCET data, college vacancy counts, and scholarship listings are aggregated from publicly available official portals for educational guidance only. StudyMacha is <strong>NOT affiliated with APSCHE, APCFSS, National Scholarship Portal (NSP), or any government body</strong>. Official cutoffs, deadlines, and seat allotments are subject to change by respective authorities. Users must verify all critical details on official government portals.
                </div>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">5. Limitation of Liability</h4>
                <p>
                  Under no circumstances shall StudyMacha, its operators, or contributors be liable for any direct, indirect, incidental, consequential, or exemplary damages arising out of your use or inability to use the platform, including but not limited to university admissions, seat allotment variances, scholarship grant decisions, exam registration disqualifications, or academic attendance shortages.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">6. Modifications to Terms</h4>
                <p>
                  We reserve the right to revise these Terms of Service at any time. Changes will be posted directly to this page with the updated revision date.
                </p>
              </div>
            </div>
          )}

          {/* DISCLAIMER */}
          {type === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="uppercase tracking-wider">Statutory Safe Harbor &amp; Legal Protection</span>
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  <strong>Disclaimer:</strong> StudyMacha is an independent informational and utility platform. AP EAPCET data, college vacancy counts, and scholarship listings are aggregated from publicly available official portals for educational guidance only. StudyMacha is <strong>NOT affiliated with APSCHE, APCFSS, National Scholarship Portal (NSP), or any government body</strong>. Official cutoffs, deadlines, and seat allotments are subject to change by respective authorities. Users must verify all critical details on official government portals.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">1. AP EAPCET Vacancy Data Verification</h4>
                <p>
                  The institutional seat vacancy records, leftover seat distributions, and annual tuition fees displayed in the AP EAPCET Vacancy Radar are sourced from public university announcements and official Phase 2 leftover seat vacancy records for analytical convenience. While we make every effort to maintain dataset precision, seat statuses dynamically change during active counselling rounds. Students must cross-verify final choices on the official state portal (<code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">eapcet-sche.aptonline.in</code>) prior to final web option submission.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">2. Scholarship Opportunities &amp; Government Schemes</h4>
                <p>
                  Information concerning national, state, and private engineering scholarships (including NSP, Vidyasaarathi, FAEA, and corporate foundations) is compiled from public notices. Eligibility criteria, application windows, and disbursement amounts are determined solely by the awarding bodies. StudyMacha does not process applications, collect fees, or guarantee scholarship disbursements.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">3. Attendance &amp; Academic Calculators</h4>
                <p>
                  Attendance and internal exam projections are mathematical estimates derived from standard institutional formulas (e.g. 75% statutory requirement, 80:20 mid evaluation models). Individual universities, colleges, and autonomous departments reserve the right to enforce custom medical condonation policies, detention norms, or lab pass marks. Always consult your departmental head or academic registrar for official exam eligibility.
                </p>

                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">4. Corrections &amp; Notice Reporting</h4>
                <p>
                  If an institution notices an error or outdated fee in our vacancy matrices, please alert our technical desk at{' '}
                  <a href={`mailto:${supportEmail}`} className="text-sky-600 font-semibold underline">
                    {supportEmail}
                  </a>{' '}
                  for prompt verification and dataset correction.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 shrink-0">
          <span>Support Contact: <strong className="text-slate-700 select-all font-mono">{supportEmail}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
