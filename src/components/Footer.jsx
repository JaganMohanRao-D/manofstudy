import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full py-4 text-center text-xs text-slate-400">
      <span>Official Portal: </span>
      <a
        href="https://manofstudy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-white hover:text-emerald-400 transition-colors"
      >
        MAN OF STUDY
      </a>
    </footer>
  );
};

export default Footer;
