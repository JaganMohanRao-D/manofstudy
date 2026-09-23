import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, GraduationCap, Lightbulb, RotateCcw, Target, Wrench, BarChart2, Layers, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { BRANCHES, CAREERS, CareerDirection, DIRECTION_LABELS, getBranch, ENTREPRENEUR_QUESTIONS, ENTREPRENEUR_SKILLS } from '../../data/gapAnalyzerData';
import { calculateCareerGap, GapAnalysisResult, SkillLevel, StudentProfile, LEVEL, label } from '../../utils/gapAnalyzer';
import { VisualGapComparison } from './VisualGapComparison';
import { TopPrioritiesCard } from './TopPrioritiesCard';
import { WhatIfSimulator } from './WhatIfSimulator';

interface Props {
  onNavigateToRoadmaps?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToDsa?: () => void;
  onNavigateToVault?: () => void;
}

const levels: { value: SkillLevel; label: string; desc: string; weight: number }[] = [
  { value: 'none', label: 'None (0)', desc: 'Not learned / No experience', weight: 0 },
  { value: 'beginner', label: 'Beginner (1)', desc: 'Theory & syntax only', weight: 1 },
  { value: 'basic', label: 'Basic (2)', desc: 'Can follow guided tutorials', weight: 2 },
  { value: 'intermediate', label: 'Intermediate (3)', desc: 'Built mini-projects independently', weight: 3 },
  { value: 'advanced', label: 'Advanced (4)', desc: 'Production-ready / Deep mastery', weight: 4 },
];

export const StudentGapAnalyzer: React.FC<Props> = ({
  onNavigateToRoadmaps,
  onNavigateToProjects,
  onNavigateToDsa,
  onNavigateToVault,
}) => {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<GapAnalysisResult | null>(null);
  const [profile, setProfile] = useState<StudentProfile>({
    year: '1st Year',
    branch: 'cse',
    cgpa: '',
    direction: 'not-sure',
    careerGoalId: undefined,
    skills: {},
    customSkills: [],
    projectsCount: 0,
    internshipsCount: 0,
    hackathonsCount: 0,
    certificationsCount: 0,
    githubExperience: 'none',
    openSourceExperience: 'none',
  });

  const branch = getBranch(profile.branch);
  const careers = useMemo(() => CAREERS.filter((c) => c.branchId === profile.branch), [profile.branch]);
  const selectedCareer = careers.find((c) => c.id === profile.careerGoalId);

  const chooseBranch = (id: string) => setProfile((p) => ({ ...p, branch: id, careerGoalId: undefined, skills: {} }));
  const chooseDirection = (direction: CareerDirection) => setProfile((p) => ({ ...p, direction, careerGoalId: undefined, skills: {} }));

  const reset = () => {
    setStep(1);
    setResult(null);
    setProfile({
      year: '1st Year',
      branch: 'cse',
      cgpa: '',
      direction: 'not-sure',
      careerGoalId: undefined,
      skills: {},
      customSkills: [],
      projectsCount: 0,
      internshipsCount: 0,
      hackathonsCount: 0,
      certificationsCount: 0,
      githubExperience: 'none',
      openSourceExperience: 'none',
    });
  };

  const analyze = () => {
    setResult(calculateCareerGap(profile));
    setStep(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canNext = () => {
    if (step === 1) return !!profile.year && !!profile.branch;
    if (step === 2) return !!profile.direction;
    if (step === 3) return profile.direction === 'entrepreneur' || profile.direction === 'not-sure' || !!profile.careerGoalId;
    return true;
  };

  // Resolve questions for Step 4
  const step4Items = useMemo(() => {
    if (profile.direction === 'entrepreneur') {
      return ENTREPRENEUR_SKILLS.map((s) => {
        const q = ENTREPRENEUR_QUESTIONS.find((item) => item.skillId === s.id);
        return {
          id: s.id,
          name: s.name,
          description: s.description,
          question: q?.question,
        };
      });
    }

    if (selectedCareer) {
      return selectedCareer.skills.map((req) => {
        const skill = branch.domainSkills.find((s) => s.id === req.skillId);
        const q = selectedCareer.questions?.find((item) => item.skillId === req.skillId);
        return {
          id: req.skillId,
          name: skill?.name || req.skillId,
          description: skill?.description || req.why,
          question: q?.question,
          targetLevel: req.target,
        };
      });
    }

    // Default branch skills
    return branch.domainSkills.slice(0, 6).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      question: undefined,
      targetLevel: 'intermediate' as SkillLevel,
    }));
  }, [profile.direction, selectedCareer, branch]);

  const targetProjectsHint = profile.year === '1st Year' ? 1 : profile.year === '2nd Year' ? 2 : 3;

  if (result) {
    return (
      <Results
        result={result}
        profile={profile}
        branch={branch}
        careers={careers}
        reset={reset}
        onNavigateToRoadmaps={onNavigateToRoadmaps}
        onNavigateToProjects={onNavigateToProjects}
        onNavigateToDsa={onNavigateToDsa}
        onNavigateToVault={onNavigateToVault}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            AI Student Gap Analyzer
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            • Empirical 0–4 Weighted Assessment
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Find your real engineering skill gaps — grounded in your branch.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Evaluates your profile against strict industry role benchmarks using a transparent formula:
          <span className="font-semibold text-slate-800 dark:text-slate-200"> Skills (max 70%) + Projects (max 20%) + Experience (max 10%)</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Branch-Specific Benchmarks', '0–4 Numeric Skill Weights', 'Transparent 70-20-10 Formula', 'Verifiable Project Proof'].map((x) => (
            <span key={x} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {x}
            </span>
          ))}
        </div>
      </section>

      {/* Stepper Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {['Branch & Year', 'Direction', 'Target Career', 'Skills Assessment', 'Portfolio & Experience'].map((x, i) => (
          <div
            key={x}
            className={`flex items-center gap-2 shrink-0 py-1.5 px-3 rounded-xl transition-all ${
              step === i + 1
                ? 'bg-emerald-500 text-white shadow-xs'
                : step > i + 1
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-400 bg-slate-100 dark:bg-slate-800/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black bg-white/20">
              {step > i + 1 ? '✓' : i + 1}
            </span>
            <span>{x}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Branch & Year */}
      {step === 1 && (
        <Panel icon={<GraduationCap />} title="1. Select your Engineering Branch & Current Year">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Skill requirements are tailored specifically to your branch — whether Core (Mechanical, Civil, Chemical, ECE, EEE) or Tech (CSE, IT, AIML, DS, Cybersecurity).
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BRANCHES.map((b) => (
              <Choice
                key={b.id}
                selected={profile.branch === b.id}
                onClick={() => chooseBranch(b.id)}
                title={b.name}
                description={b.description}
              />
            ))}
          </div>
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Current Academic Year
            </label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['1st Year', '2nd Year', '3rd Year', '4th Year'] as const).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, year: y }))}
                  className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                    profile.year === y
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Step 2: Direction */}
      {step === 2 && (
        <Panel icon={<Compass />} title="2. What career direction interests you?">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Select the general pathway you are targeting after graduation.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(Object.entries(DIRECTION_LABELS) as [CareerDirection, string][]).map(([id, name]) => (
              <Choice
                key={id}
                selected={profile.direction === id}
                onClick={() => chooseDirection(id)}
                title={name}
                description={
                  id === 'entrepreneur'
                    ? 'Problem validation, customer interviews, MVPs and business execution — coding not strictly required.'
                    : id === 'not-sure'
                    ? 'Explore branch-connected career options without forcing a single narrow specialty.'
                    : 'Target specialized engineering and technical roles in industry.'
                }
              />
            ))}
          </div>
        </Panel>
      )}

      {/* Step 3: Career Goal */}
      {step === 3 && (
        <Panel
          icon={<Target />}
          title={profile.direction === 'not-sure' ? '3. Explore branch career paths' : '3. Choose your target career role'}
        >
          {profile.direction === 'entrepreneur' ? (
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">Startup / Entrepreneurship Track</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your assessment will focus on problem discovery, customer interviews, business models, and lean MVP prototyping tailored to {branch.name}.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {profile.direction === 'not-sure'
                  ? `Select a career profile in ${branch.name} you would like to test your readiness against:`
                  : `Select the target role in ${branch.name} to compare your current skill levels against industry expectations:`}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {careers.map((c) => (
                  <Choice
                    key={c.id}
                    selected={profile.careerGoalId === c.id}
                    onClick={() => setProfile((p) => ({ ...p, careerGoalId: c.id }))}
                    title={c.title}
                    description={c.shortDescription}
                  />
                ))}
              </div>
            </>
          )}
        </Panel>
      )}

      {/* Step 4: Skills Assessment (Strict 0-4 weights) */}
      {step === 4 && (
        <Panel icon={<Wrench />} title="4. Empirical Skill Self-Assessment (0–4 Scale)">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 mb-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-100">Scoring Guidelines: </span>
            <span>Rate honestly based on practical ability. </span>
            <span className="font-medium">None (0)</span>: Not learned; <span className="font-medium">Beginner (1)</span>: Theory only; <span className="font-medium">Basic (2)</span>: Guided tutorials; <span className="font-medium">Intermediate (3)</span>: Built mini-projects; <span className="font-medium">Advanced (4)</span>: Independent mastery.
          </div>

          <div className="space-y-4">
            {step4Items.map((item) => {
              const currentVal: SkillLevel = profile.skills[item.id] || 'none';
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {item.name}
                        </h3>
                        {item.targetLevel && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                            Target: {item.targetLevel.toUpperCase()} ({LEVEL[item.targetLevel]}/4)
                          </span>
                        )}
                      </div>
                      {item.question ? (
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {item.question}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Level selector buttons on larger screens, select on mobile */}
                    <div className="shrink-0">
                      <div className="sm:hidden">
                        <select
                          value={currentVal}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              skills: { ...p.skills, [item.id]: e.target.value as SkillLevel },
                            }))
                          }
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-white"
                        >
                          {levels.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label} — {o.desc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                        {levels.map((lvl) => {
                          const isSelected = currentVal === lvl.value;
                          return (
                            <button
                              key={lvl.value}
                              type="button"
                              onClick={() =>
                                setProfile((p) => ({
                                  ...p,
                                  skills: { ...p.skills, [item.id]: lvl.value },
                                }))
                              }
                              title={lvl.desc}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                              }`}
                            >
                              {lvl.weight} • {lvl.value.charAt(0).toUpperCase() + lvl.value.slice(1)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Step 5: Portfolio Context (Projects, Internships, Hackathons) */}
      {step === 5 && (
        <Panel icon={<GraduationCap />} title="5. Portfolio & Practical Experience">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">
              Formula Weighting:
            </p>
            <p>
              • <span className="font-semibold text-emerald-600 dark:text-emerald-400">Projects (max 20%):</span> For a {profile.year} student, target is {targetProjectsHint} practical project(s).
            </p>
            <p>
              • <span className="font-semibold text-sky-600 dark:text-sky-400">Internships & Hackathons (max 10%):</span> 5% per verifiable internship or hackathon (capped at 10%).
            </p>
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-4">
            <label className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Projects Built
              </span>
              <input
                type="number"
                min="0"
                max="50"
                value={profile.projectsCount}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, projectsCount: Math.max(0, Number(e.target.value)) }))
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Target for {profile.year}: {targetProjectsHint}+
              </span>
            </label>

            <label className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Internships
              </span>
              <input
                type="number"
                min="0"
                max="20"
                value={profile.internshipsCount}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, internshipsCount: Math.max(0, Number(e.target.value)) }))
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Completed or ongoing
              </span>
            </label>

            <label className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Hackathons / Contests
              </span>
              <input
                type="number"
                min="0"
                max="30"
                value={profile.hackathonsCount}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, hackathonsCount: Math.max(0, Number(e.target.value)) }))
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Campus or regional competitions
              </span>
            </label>
          </div>
        </Panel>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 5 ? (
          <button
            type="button"
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs disabled:opacity-40 transition-colors"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={analyze}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-7 py-3 text-sm font-bold text-white shadow-md transition-colors"
          >
            <Check className="w-4 h-4" /> Calculate Readiness & Gaps
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------------- RESULTS VIEW ---------------- */

function Results({
  result,
  profile,
  branch,
  careers,
  reset,
  onNavigateToRoadmaps,
  onNavigateToProjects,
  onNavigateToDsa,
  onNavigateToVault,
}: {
  result: GapAnalysisResult;
  profile: StudentProfile;
  branch: ReturnType<typeof getBranch>;
  careers: typeof CAREERS;
  reset: () => void;
  onNavigateToRoadmaps?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToDsa?: () => void;
  onNavigateToVault?: () => void;
}) {
  const readinessTier =
    result.matchScore >= 80
      ? { label: 'Interview Ready', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400' }
      : result.matchScore >= 60
      ? { label: 'Solid Foundation', color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-400' }
      : result.matchScore >= 40
      ? { label: 'Emerging Competence', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400' }
      : { label: 'Early Explorer', color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400' };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner with Readiness Tier */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                AI Gap Analysis Report
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${readinessTier.color}`}>
                {readinessTier.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {result.careerTitle}
            </h1>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {result.branchName} • {profile.year} • {DIRECTION_LABELS[result.direction]}
            </p>
            <p className="max-w-3xl text-xs sm:text-sm leading-6 text-slate-500 dark:text-slate-400">
              {result.careerDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Start New Assessment
          </button>
        </div>
      </section>

      {/* 2. Transparent 70-20-10 Scorecard Component */}
      <section className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-emerald-100 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Industry Readiness Index
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white">
                {result.matchScore}%
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                / 100% Target
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculated using the strict weighted formula: Skills (70%) + Projects (20%) + Experience (10%).
            </p>
          </div>

          {/* 3 Pillar Summary Cards */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Skills
              </p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {result.skillsScore}%
              </p>
              <p className="text-[10px] text-slate-400">Max 70%</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-sky-100 dark:border-sky-900/40 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Projects
              </p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {result.projectScore}%
              </p>
              <p className="text-[10px] text-slate-400">Max 20%</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 p-3.5 text-center shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Experience
              </p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {result.expScore}%
              </p>
              <p className="text-[10px] text-slate-400">Max 10%</p>
            </div>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Score Composition</span>
            <span>Total: {result.matchScore} / 100</span>
          </div>
          <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden p-0.5">
            <div
              style={{ width: `${result.skillsScore}%` }}
              className="h-full bg-emerald-500 rounded-l-full"
              title={`Skills Score: ${result.skillsScore}%`}
            />
            <div
              style={{ width: `${result.projectScore}%` }}
              className="h-full bg-sky-500"
              title={`Projects Score: ${result.projectScore}%`}
            />
            <div
              style={{ width: `${result.expScore}%` }}
              className="h-full bg-indigo-500 rounded-r-full"
              title={`Experience Score: ${result.expScore}%`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Core Skills ({result.skillsScore}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Practical Projects ({result.projectScore}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Experience / Hackathons ({result.expScore}%)
            </span>
          </div>
        </div>

        {/* Metric Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Assessed Skills</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{result.skillsAssessed}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">At / Above Target</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {result.skillsAtTarget}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Target Coverage</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {result.skillCoveragePercent}%
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Remaining Gap</p>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400">
              {result.skillGapPercent}%
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Visual Gap Comparison (Bars & Radar Chart) */}
      <VisualGapComparison comparisons={result.comparisons} />

      {/* 4. Top Priorities & Direct Action Items */}
      <TopPrioritiesCard
        priorities={result.topPriorities}
        nextActions={result.nextActions}
        branchId={profile.branch}
        onNavigateToRoadmaps={onNavigateToRoadmaps}
        onNavigateToProjects={onNavigateToProjects}
        onNavigateToDsa={onNavigateToDsa}
        onNavigateToVault={onNavigateToVault}
      />

      {/* 5. What-If Scenario Simulator */}
      <WhatIfSimulator originalProfile={profile} />

      {/* 6. Strengths, Build Further & Priority Gaps */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ResultCard
          title="Current Strengths"
          items={result.strengths.map((x) => x.title)}
          empty="No clear strengths reached the role target yet."
          tone="green"
        />
        <ResultCard
          title="Build Further"
          items={result.needsImprovement.map((x) => x.title)}
          empty="No skills in this category."
          tone="amber"
        />
        <ResultCard
          title="Priority Gaps"
          items={result.majorGaps.map((x) => x.title)}
          empty="No major gaps identified from your answers."
          tone="red"
        />
      </div>

      {/* 7. Practical Verifiable Project Roadmap */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Practical Project Proof Roadmap
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Building these concrete deliverables bridges your portfolio gap and proves your capability to interviewers.
        </p>
        <div className="space-y-3">
          {result.roadmap.map((r) => (
            <div
              key={r.stageNumber}
              className="flex gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 items-start"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black shrink-0">
                0{r.stageNumber}
              </span>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {r.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Deliverable: <span className="font-semibold text-slate-700 dark:text-slate-200">{r.deliverable}</span> • Estimated: {r.estimatedTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Disclaimer & Actions */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs leading-5 text-amber-900 dark:text-amber-200">
        <strong>Academic Notice: </strong> {result.disclaimer}
      </div>

      {onNavigateToRoadmaps && (
        <button
          type="button"
          onClick={onNavigateToRoadmaps}
          className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3.5 font-bold shadow-md cursor-pointer transition-colors"
        >
          Explore Man of Study Engineering Roadmaps
        </button>
      )}
    </div>
  );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function Panel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs">
      <div className="flex items-center gap-2 mb-5 text-slate-900 dark:text-white">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-emerald-500' })}
        <h2 className="text-lg sm:text-xl font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const Choice: React.FC<{
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}> = ({ selected, onClick, title, description }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
        selected
          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/15'
          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {selected && <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
      </div>
    </button>
  );
};

function ResultCard({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: string[];
  empty: string;
  tone: 'green' | 'amber' | 'red';
}) {
  const cls = tone === 'green' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
      <h2 className={`font-extrabold text-base ${cls}`}>{title}</h2>
      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 5).map((x) => (
            <li key={x} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-slate-400 dark:text-slate-500 mt-1">•</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{empty}</p>
      )}
    </section>
  );
}

export default StudentGapAnalyzer;

