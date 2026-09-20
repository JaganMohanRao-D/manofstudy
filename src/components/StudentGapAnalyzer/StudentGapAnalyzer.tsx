import React, { useState, useTransition } from 'react';
import {
  StudentProfile,
  calculateCareerGap,
  GapAnalysisResult,
  EXPO_DEMO_PROFILE,
  SAMPLE_PROFILES,
} from '../../utils/gapAnalyzer';
import {
  DEFAULT_TECHNICAL_SKILLS,
  CAREER_PROFILES,
  SKILL_LEVEL_LABELS,
  SkillLevel,
} from '../../data/careerRequirementsData';
import { VisualGapComparison } from './VisualGapComparison';
import { TopPrioritiesCard } from './TopPrioritiesCard';
import { CareerRoadmapFlow } from './CareerRoadmapFlow';
import { WhatIfSimulator } from './WhatIfSimulator';
import {
  Sparkles,
  Award,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Printer,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
  Wrench,
  Code2,
  Plus,
  Trash2,
  HelpCircle,
  Info,
  Check,
  BrainCircuit,
  Compass,
} from 'lucide-react';

interface StudentGapAnalyzerProps {
  onNavigateToRoadmaps?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToDsa?: () => void;
  onNavigateToVault?: () => void;
}

export const StudentGapAnalyzer: React.FC<StudentGapAnalyzerProps> = ({
  onNavigateToRoadmaps,
  onNavigateToProjects,
  onNavigateToDsa,
  onNavigateToVault,
}) => {
  // Navigation tabs for input form
  const [activeFormTab, setActiveFormTab] = useState<'academic' | 'skills' | 'portfolio'>('academic');

  // View state: 'form' vs 'results'
  const [viewState, setViewState] = useState<'form' | 'results'>('form');

  // Student Profile State
  const [profile, setProfile] = useState<StudentProfile>(() => ({
    year: '1st Year',
    branch: 'CSE',
    cgpa: 8.2,
    semester: 'Sem 2',
    careerGoalId: 'software-developer',
    skills: {
      c: 'basic',
      cpp: 'none',
      java: 'none',
      python: 'basic',
      html: 'intermediate',
      css: 'intermediate',
      javascript: 'basic',
      sql: 'none',
      git_github: 'basic',
      dsa: 'beginner',
      oop: 'none',
      dbms: 'none',
      computer_networks: 'none',
      operating_systems: 'none',
      cloud: 'none',
      ai_ml: 'none',
      problem_solving: 'beginner',
      communication: 'basic',
    },
    customSkills: [],
    projectsCount: 2,
    internshipsCount: 0,
    hackathonsCount: 1,
    certificationsCount: 1,
    githubExperience: 'basic',
    openSourceExperience: 'none',
  }));

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Custom skill input modal state
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('basic');
  const [showAddCustomSkill, setShowAddCustomSkill] = useState<boolean>(false);

  // AI Mentor Note state
  const [aiMentorNote, setAiMentorNote] = useState<string | null>(null);
  const [isGeneratingAiNote, setIsGeneratingAiNote] = useState<boolean>(false);

  // 1-Click Load Presets
  const handleLoadPreset = (preset: StudentProfile) => {
    setProfile(JSON.parse(JSON.stringify(preset)));
  };

  // Skill Level update helper
  const handleSkillChange = (skillId: string, level: SkillLevel) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: level,
      },
    }));
  };

  // Add custom skill
  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const id = newSkillName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setProfile((prev) => ({
      ...prev,
      customSkills: [
        ...prev.customSkills.filter((s) => s.id !== id),
        { id, name: newSkillName.trim(), level: newSkillLevel },
      ],
    }));
    setNewSkillName('');
    setShowAddCustomSkill(false);
  };

  const handleRemoveCustomSkill = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      customSkills: prev.customSkills.filter((s) => s.id !== id),
    }));
  };

  // Core Action: Analyze My Gap
  const handleAnalyzeGap = async () => {
    setIsAnalyzing(true);

    // Compute deterministic analysis
    const result = calculateCareerGap(profile);
    setAnalysisResult(result);

    // Attempt optional Gemini AI Mentor note via API
    setAiMentorNote(null);
    setIsGeneratingAiNote(true);

    // Transition smoothly to results
    setTimeout(() => {
      startTransition(() => {
        setViewState('results');
        setIsAnalyzing(false);
      });
      // Scroll to top of results container
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);

    // Fetch AI Mentor Note in background with graceful fallback
    try {
      const resp = await fetch('/api/gemini/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: profile,
          gapAnalysisResult: result,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.mentorNote) {
          setAiMentorNote(data.mentorNote);
        }
      }
    } catch {
      // Graceful silence, client has rich deterministic summary
    } finally {
      setIsGeneratingAiNote(false);
    }
  };

  // Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  // Reset Form
  const handleResetForm = () => {
    setProfile({
      year: '1st Year',
      branch: 'CSE',
      cgpa: 7.5,
      semester: 'Sem 1',
      careerGoalId: 'software-developer',
      skills: {},
      customSkills: [],
      projectsCount: 0,
      internshipsCount: 0,
      hackathonsCount: 0,
      certificationsCount: 0,
      githubExperience: 'none',
      openSourceExperience: 'none',
    });
    setAnalysisResult(null);
    setViewState('form');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner & Expo Demonstration Badge */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI SKILL GAP DIAGNOSTIC</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Deterministic Gap Engine
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              AI Student Gap Analyzer
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-3xl leading-relaxed">
              Answer the essential four questions:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                “Where am I right now, where do I want to go, what am I missing, and what should I do next?”
              </strong>
            </p>
          </div>

          {/* Quick Preset Launchers */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleLoadPreset(EXPO_DEMO_PROFILE);
                // If in results, immediately recalculate
                if (viewState === 'results') {
                  const res = calculateCareerGap(EXPO_DEMO_PROFILE);
                  setAnalysisResult(res);
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Load Sample Profile (1st Year CSE)</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Try other presets:</span>
              <button
                type="button"
                onClick={() => handleLoadPreset(SAMPLE_PROFILES[1].profile)}
                className="underline hover:text-indigo-600 cursor-pointer"
              >
                2nd Yr IT
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleLoadPreset(SAMPLE_PROFILES[2].profile)}
                className="underline hover:text-indigo-600 cursor-pointer"
              >
                3rd Yr AI/DS
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-rose-500 hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN VIEW SWITCHER */}
      {viewState === 'form' ? (
        /* ================= INPUT FORM VIEW ================= */
        <div className="space-y-6">
          {/* Step / Tabs Indicator */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveFormTab('academic')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFormTab === 'academic'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">1. Academic &amp; Career Goal</span>
              <span className="sm:hidden">1. Academic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('skills')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFormTab === 'skills'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">2. Technical Skills Matrix</span>
              <span className="sm:hidden">2. Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('portfolio')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFormTab === 'portfolio'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">3. Experience &amp; Portfolio</span>
              <span className="sm:hidden">3. Portfolio</span>
            </button>
          </div>

          {/* Form Tab 1: Academic & Career Goal */}
          {activeFormTab === 'academic' && (
            <div className="space-y-6">
              {/* Academic Details Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <span>Academic Standing</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your current year of study and academic branch set the evaluation benchmarks.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Year */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Current Year <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['1st Year', '2nd Year', '3rd Year', '4th Year'] as const).map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, year: yr }))}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            profile.year === yr
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Branch / Degree */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Degree &amp; Branch <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.branch}
                      onChange={(e) => setProfile((p) => ({ ...p, branch: e.target.value }))}
                      placeholder="e.g. CSE, IT, AI/DS, ECE"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-slate-400">Quick:</span>
                      {['CSE', 'IT', 'AI/DS', 'ECE', 'Mech', 'Civil', 'BCA'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, branch: b }))}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CGPA */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Current CGPA / Percentage <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={profile.cgpa}
                      onChange={(e) => setProfile((p) => ({ ...p, cgpa: e.target.value }))}
                      placeholder="e.g. 8.2 (or 82%)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <span className="text-[11px] text-slate-500 block">
                      Used to check campus placement cutoff margins (typically 7.0+ CGPA).
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Career Selection Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-500" />
                    <span>Target Career Goal (Where do you want to go?)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select your primary aspiration to compare your skills against verified industry requirement benchmarks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CAREER_PROFILES.map((c) => {
                    const isSelected = profile.careerGoalId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setProfile((p) => ({ ...p, careerGoalId: c.id }))}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {c.title}
                            </h4>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {c.tagline}
                          </p>
                        </div>

                        <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <span>{c.requirements.length} Evaluated Benchmarks</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Next Step Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('skills')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all"
                  >
                    <span>Proceed to Skills Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Tab 2: Technical Skills Matrix */}
          {activeFormTab === 'skills' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-500" />
                    <span>Technical Skills Assessment</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Self-rate your current proficiency level for core engineering and technology skills.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCustomSkill(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Custom Skill</span>
                </button>
              </div>

              {/* Add Custom Skill Inline Modal */}
              {showAddCustomSkill && (
                <form
                  onSubmit={handleAddCustomSkill}
                  className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-end gap-3 text-xs"
                >
                  <div className="w-full sm:flex-1 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Custom Skill Name</label>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. React.js, Docker, Rust, Flutter, Figma"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                      autoFocus
                    />
                  </div>
                  <div className="w-full sm:w-48 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Proficiency Level</label>
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="none">None (0%)</option>
                      <option value="beginner">Beginner (25%)</option>
                      <option value="basic">Basic (50%)</option>
                      <option value="intermediate">Intermediate (75%)</option>
                      <option value="advanced">Advanced (100%)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomSkill(false)}
                      className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {DEFAULT_TECHNICAL_SKILLS.map((skill) => {
                  const currentLevel: SkillLevel = profile.skills[skill.id] || 'none';

                  return (
                    <div
                      key={skill.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            {skill.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {skill.description}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                          {currentLevel.toUpperCase()}
                        </span>
                      </div>

                      {/* 5-State Pill Segmented Selector */}
                      <div className="grid grid-cols-5 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        {(['none', 'beginner', 'basic', 'intermediate', 'advanced'] as SkillLevel[]).map((lvl) => {
                          const isCurrent = currentLevel === lvl;

                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleSkillChange(skill.id, lvl)}
                              className={`py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer text-center truncate px-0.5 ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                              }`}
                              title={SKILL_LEVEL_LABELS[lvl]}
                            >
                              {lvl === 'none'
                                ? 'None'
                                : lvl === 'beginner'
                                ? 'Beg'
                                : lvl === 'basic'
                                ? 'Basic'
                                : lvl === 'intermediate'
                                ? 'Inter'
                                : 'Adv'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Skills List */}
              {profile.customSkills.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Custom Added Skills:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.customSkills.map((cs) => (
                      <div
                        key={cs.id}
                        className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cs.name}</span>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-semibold">
                            Level: {cs.level.toUpperCase()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSkill(cs.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('academic')}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  ← Back to Academics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab('portfolio')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs"
                >
                  <span>Proceed to Experience &amp; Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form Tab 3: Experience & Portfolio */}
          {activeFormTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    <span>Experience, Projects &amp; Credentials</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quantify your practical proof-of-work: projects, internships, hackathons, and version control habits.
                  </p>
                </div>

                {/* 4 Stepper Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Projects */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Completed Projects
                      </span>
                      <Code2 className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {profile.projectsCount}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, projectsCount: Math.max(0, p.projectsCount - 1) }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, projectsCount: p.projectsCount + 1 }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Internships */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Tech Internships
                      </span>
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {profile.internshipsCount}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, internshipsCount: Math.max(0, p.internshipsCount - 1) }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, internshipsCount: p.internshipsCount + 1 }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hackathons */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Hackathons
                      </span>
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {profile.hackathonsCount}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, hackathonsCount: Math.max(0, p.hackathonsCount - 1) }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, hackathonsCount: p.hackathonsCount + 1 }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Certifications
                      </span>
                      <GraduationCap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {profile.certificationsCount}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, certificationsCount: Math.max(0, p.certificationsCount - 1) }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, certificationsCount: p.certificationsCount + 1 }))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GitHub & Open Source selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      GitHub Activity &amp; Repositories
                    </label>
                    <select
                      value={profile.githubExperience}
                      onChange={(e) => setProfile((p) => ({ ...p, githubExperience: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="none">No GitHub account yet</option>
                      <option value="basic">Basic account / Few sample repos</option>
                      <option value="active_repo">Active repository owner (pinned projects)</option>
                      <option value="frequent_contributor">Frequent daily/weekly commit history</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Open Source Experience
                    </label>
                    <select
                      value={profile.openSourceExperience}
                      onChange={(e) => setProfile((p) => ({ ...p, openSourceExperience: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="none">No open-source participation</option>
                      <option value="beginner">Beginner (starred repos, explored issues)</option>
                      <option value="contributed_prs">Contributed merged Pull Requests (GSoC / Hacktoberfest)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. PROMINENT ACTION BUTTON */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Ready for Instant Analysis
                  </span>
                  <h3 className="text-lg sm:text-xl font-black">
                    Analyze My Student Profile vs Industry Benchmark
                  </h3>
                  <p className="text-xs text-slate-300">
                    Runs deterministic gap comparison, extracts top 3 priorities &amp; generates next actionable steps.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleAnalyzeGap}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-black text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-emerald-500/30 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Gaps...</span>
                    </>
                  ) : (
                    <>
                      <span>ANALYZE MY GAP</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= RESULTS DASHBOARD VIEW ================= */
        analysisResult && (
          <div className="space-y-6">
            {/* Results Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewState('form')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span>← Edit Profile Inputs</span>
                </button>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Evaluated on: <strong>{analysisResult.generatedAt}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleLoadPreset(EXPO_DEMO_PROFILE);
                    const res = calculateCareerGap(EXPO_DEMO_PROFILE);
                    setAnalysisResult(res);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Load Sample Benchmark Profile</span>
                </button>
              </div>
            </div>

            {/* Top Score Banner: YOUR CAREER GAP ANALYSIS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    Target Role Benchmark
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                    YOUR CAREER GAP ANALYSIS
                  </h2>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Target: <strong className="text-indigo-600 dark:text-indigo-400">{analysisResult.careerTitle}</strong>
                    {' '}• Candidate: {profile.year} ({profile.branch})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    {analysisResult.careerTagline}. {analysisResult.careerDescription}
                  </p>
                </div>

                {/* Profile Match Score Meter */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800/60 dark:to-slate-800/20 border border-indigo-200/70 dark:border-slate-700 shrink-0 flex items-center gap-5">
                  {/* Radial Ring */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${
                          analysisResult.matchScore >= 75
                            ? 'text-emerald-500'
                            : analysisResult.matchScore >= 50
                            ? 'text-indigo-500'
                            : 'text-amber-500'
                        } transition-all duration-1000 ease-out`}
                        strokeDasharray={`${analysisResult.matchScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {analysisResult.matchScore}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Match</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Profile Match Indicator
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {profile.year} Baseline Comparison
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] leading-tight">
                      Approximate matching score calculated against core industry criteria.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Educational Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Notice: </strong>
                  {analysisResult.disclaimer}
                </p>
              </div>

              {/* AI Mentor Executive Note (Optional Gemini Integration) */}
              {(aiMentorNote || isGeneratingAiNote) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Senior Placement Advisor Note:
                    </h4>
                  </div>
                  {isGeneratingAiNote ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Generating tailored mentor advice...</span>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {aiMentorNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Categorization: STRENGTHS, NEEDS IMPROVEMENT, and MAJOR GAPS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 🟢 STRENGTHS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-950/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      🟢 STRENGTHS ({analysisResult.strengths.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Validated
                  </span>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.strengths.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🟡 NEEDS IMPROVEMENT */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-950/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      🟡 NEEDS IMPROVEMENT ({analysisResult.needsImprovement.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Elevate
                  </span>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.needsImprovement.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔴 MAJOR GAPS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      🔴 MAJOR GAPS ({analysisResult.majorGaps.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    High Screening Risk
                  </span>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.majorGaps.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Gap Comparison (Current vs Target) */}
            <VisualGapComparison comparisons={analysisResult.comparisons} />

            {/* Top 3 Priorities & Next 3 Actions */}
            <TopPrioritiesCard
              priorities={analysisResult.topPriorities}
              nextActions={analysisResult.nextActions}
              onNavigateToRoadmaps={onNavigateToRoadmaps}
              onNavigateToProjects={onNavigateToProjects}
              onNavigateToDsa={onNavigateToDsa}
              onNavigateToVault={onNavigateToVault}
            />

            {/* Personalized Career Roadmap Flow */}
            <CareerRoadmapFlow
              careerTitle={analysisResult.careerTitle}
              roadmap={analysisResult.roadmap}
              studentYear={profile.year}
            />

            {/* "What-If?" Scenario Simulator */}
            <WhatIfSimulator originalProfile={profile} />
          </div>
        )
      )}
    </div>
  );
};
export default StudentGapAnalyzer;
