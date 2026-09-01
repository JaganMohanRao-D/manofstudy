import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Image as ImageIcon,
  FileSearch,
  FileText,
  Calculator,
  Bot,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { ToolTab } from '../types';

interface HeaderProps {
  activeTab: ToolTab;
  setActiveTab: (tab: ToolTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const tools: Array<{ id: ToolTab; name: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'attendance', name: 'Attendance Defender', icon: ShieldCheck },
    { id: 'gpa', name: 'Global GPA Hub', icon: GraduationCap },
    { id: 'internal-calc', name: 'Internal Cutoff', icon: Calculator },
    { id: 'resizer', name: 'Image Resizer', icon: ImageIcon },
    { id: 'resume-checker', name: 'ATS Matcher', icon: FileSearch },
    { id: 'humanizer', name: 'AI Humanizer', icon: Bot },
    { id: 'pdf-tools', name: 'PDF Tools', icon: FileText },
  ];

  const handleSelectTab = (tab: ToolTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 border-slate-200 bg-white/95 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  STUDYMACHA
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Student Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal hidden sm:block">
                Academic & Career Productivity Utilities
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTab(tool.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white border border-sky-500 shadow-sm font-semibold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tool.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-all duration-200 ease-out active:scale-95 cursor-pointer shadow-xs"
              aria-label="Open Tool Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Scrollable Tool Pills */}
        <div className="flex lg:hidden py-2.5 border-t border-slate-200 gap-1.5 overflow-x-auto no-scrollbar">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTab(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white border border-sky-500 shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto shadow-lg">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2">
              Student Utilities
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTab(tool.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-sky-500 text-white border-sky-500 font-semibold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-xs">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
