import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';

export const Footer = ({ onOpenLegalModal, onOpenSupportModal }) => (
  <footer id="app-footer" className="mos-k-footer w-full">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-[1.3fr_.7fr]">
        <div>
          <a href="/" aria-label="Naa College home" className="flex items-center gap-3">
            <img src="/Naa%20College%20logo.webp" alt="Naa College logo" width="56" height="56" className="h-14 w-14 object-contain" loading="lazy" />
            <div>
              <div className="font-['Syne'] text-2xl font-extrabold uppercase tracking-[-.04em]">Naa College</div>
              <div className="text-[9px] uppercase tracking-[.18em] text-[#777b82]">Student utility platform</div>
            </div>
          </a>
          <p className="mt-7 max-w-2xl text-xs leading-7 text-[#858990]">A student-first platform for admissions, allotment data, academic utilities, career resources and practical tools. AP &amp; Telangana counselling data, student workspaces and browser-based utilities — all in one place.</p>
          <div className="mt-6 text-[10px] uppercase tracking-[.14em] text-[#777b82]">Independent educational resource / Not affiliated with any government body</div>
        </div>
        <div className="md:justify-self-end">
          <div className="text-[10px] uppercase tracking-[.15em] text-[#777b82]">Navigate</div>
          <div className="mt-4 grid gap-2 text-xs text-[#b8bbc0]">
            <button type="button" onClick={() => onOpenLegalModal?.('privacy')} className="text-left hover:text-[#22d3ee]">Privacy Policy</button>
            <button type="button" onClick={() => onOpenLegalModal?.('terms')} className="text-left hover:text-[#22d3ee]">Terms of Service</button>
            <button type="button" onClick={() => onOpenLegalModal?.('disclaimer')} className="text-left hover:text-[#22d3ee]">Legal Safe Harbor &amp; Disclaimers</button>
            <button type="button" onClick={() => onOpenLegalModal?.('about')} className="text-left hover:text-[#22d3ee]">About Naa College</button>
            <button type="button" onClick={() => onOpenLegalModal?.('contact')} className="text-left hover:text-[#22d3ee]">Contact Support</button>
            {onOpenSupportModal && <button type="button" onClick={onOpenSupportModal} className="inline-flex items-center gap-2 text-left text-[#22d3ee]"><Heart size={12}/> Support Naa College</button>}
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mk-built">Built by Jagan Mohan Rao Dunna</div>
          <div className="mt-2 text-[11px] text-[#666a71]">© 2026 Naa College. All rights reserved.</div>
        </div>
        <div className="text-right text-[10px] uppercase tracking-[.12em] text-[#666a71]">Built for students / Built to be useful <ArrowUpRight className="ml-1 inline" size={12}/></div>
      </div>
    </div>
  </footer>
);

export default Footer;
