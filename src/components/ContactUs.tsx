import React, { useState } from 'react';
import { Mail, Send, Check, Copy, MessageSquare, ArrowLeft, Clock, Sparkles } from 'lucide-react';

export interface ContactUsProps {
  onBack?: () => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onBack }) => {
  const supportEmail = 'support.jamord@gmail.com';
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderCollege, setSenderCollege] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('Feedback & Suggestions');
  const [message, setMessage] = useState('');
  const [isPrepared, setIsPrepared] = useState(false);

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supportEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
      `[MAN OF STUDY ${subjectCategory}] from ${senderName || 'Student'} (${senderCollege || 'College'})`
    )}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
    setIsPrepared(true);
    setTimeout(() => setIsPrepared(false), 3500);
  };

  return (
    <div id="contact-us-view" className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-200">
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
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-10 space-y-4 shadow-xl">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Developer Desk &amp; Student Support</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Contact MAN OF STUDY
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Have a question regarding TG/AP EAPCET allotment data, noticed a university formula discrepancy, want to report a tool bug, or have a suggestion? We respond within 24 to 48 hours.
          </p>
        </div>
      </div>

      {/* Grid: Direct Contact Channels & Interactive Email Draft Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Primary Direct Channel
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official Support Email
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">
                {supportEmail}
              </span>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                title="Copy email address"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Typical response time: 24–48 business hours</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Telugu &amp; English communications supported</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 space-y-2 text-xs">
            <span className="font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider block text-[11px]">
              Platform Operator
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              MAN OF STUDY is engineered and curated by Dunna Jagan Mohan Rao (creator of PlantMokk AI). Your suggestions directly influence upcoming feature releases and academic tools.
            </p>
          </div>
        </div>

        {/* Message Drafting Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Send a Direct Message</span>
            </h3>
            <p className="text-xs text-slate-500">
              Fill out this quick form to open a pre-filled draft in your preferred email client.
            </p>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  value={senderCollege}
                  onChange={(e) => setSenderCollege(e.target.value)}
                  placeholder="e.g. JNTUK Kakinada / GVP"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Category
              </label>
              <select
                value={subjectCategory}
                onChange={(e) => setSubjectCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AP EAPCET Vacancy Data Inquiry">AP EAPCET Vacancy Data Inquiry</option>
                <option value="Attendance / GPA Formula Bug">Attendance / GPA Formula Bug</option>
                <option value="PDF / Image Resizer Tool Feedback">PDF / Image Resizer Tool Feedback</option>
                <option value="Branch Roadmap Suggestion">Branch Roadmap Suggestion</option>
                <option value="Feedback & Suggestions">General Feedback & Suggestions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback, question, or bug report with relevant details..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Direct mail destination: {supportEmail}
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPrepared ? 'Email Draft Ready!' : 'Send Message via Email'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
