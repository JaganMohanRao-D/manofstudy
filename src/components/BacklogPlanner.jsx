import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  BookOpen,
  Target,
  RotateCcw,
  ShieldAlert,
  Flame,
  Check,
  ChevronRight,
  Printer,
  Compass,
  FileCheck
} from 'lucide-react';

// Subject type definitions and revision curricula
export const SUBJECT_PRESETS = [
  {
    id: 'maths',
    name: 'Mathematics & Theory',
    example: 'M1, M2, M3, Transform Calculus, Probability & Statistics, Discrete Maths',
    riskLevel: 'High Backlog Rate (38%)',
    strategySummary:
      'Focus strictly on high-scoring standard formula derivations and repeated matrix/eigenvalue/ODE problems. Do not attempt all 5 units; master 2.5 units thoroughly.',
    dayPlans: [
      { day: 1, title: 'Syllabus Triaging & PYQ Audit', task: 'Collect the last 4 semester regular/supply question papers. Identify the 2 units carrying guaranteed choice questions.' },
      { day: 2, title: 'Unit 1: Core Definitions & Formulas', task: 'Write down all definitions and base formulas on a 2-page master cheat sheet.' },
      { day: 3, title: 'Unit 1: Standard Solved Examples', task: 'Solve 6 classic textbook numericals by hand. Never just read math; write step-by-step.' },
      { day: 4, title: 'Unit 1: Repeated University 10-Markers', task: 'Solve the exact Unit 1 questions from the 2023 and 2024 supply papers.' },
      { day: 5, title: 'Unit 2: Fundamental Theorems', task: 'Derive key theorems (e.g., Cayley-Hamilton, Taylor series, Green/Stokes theorems).' },
      { day: 6, title: 'Unit 2: Numerical Drilling', task: 'Practice 8 matrix/vector/calculus problems without referencing solution manuals.' },
      { day: 7, title: 'Phase 1 Review & Mini-Test', task: 'Solve a 20-mark practice test combining Unit 1 & Unit 2 in 45 minutes.' },
      { day: 8, title: 'Unit 3: Concept Dissection', task: 'Pick the easiest 60% sub-topics of Unit 3. Leave the most complex 40%.' },
      { day: 9, title: 'Unit 3: Step-by-Step Template Questions', task: 'Solve 5 standard differential equation / probability distribution problems.' },
      { day: 10, title: 'Unit 3: PYQ Pattern Matching', task: 'Verify if Unit 3 choice question in university paper follows recurring templates.' },
      { day: 11, title: 'Formula Sheet Deep-Drill', task: 'Re-write the master formula sheet from memory without peeking. Fix memory blanks.' },
      { day: 12, title: 'Unit 4: Low-Hanging Fruit Topics', task: 'Learn 2 predictable 5-mark short questions from Unit 4.' },
      { day: 13, title: 'Unit 4: Essential Derivations', task: 'Practice 2 core derivations that appear frequently in Part-B.' },
      { day: 14, title: 'Unit 5: Scan & Selective Formulas', task: 'Learn the basic definitions and simplest formula from Unit 5 for compulsory Part-A.' },
      { day: 15, title: 'Mid-Way Milestone Self-Evaluation', task: 'Test yourself on 3 full 14-mark university questions. Grade strictly.' },
      { day: 16, title: 'Eliminate Step-Marking Leaks', task: 'Review where marks are lost: missed units, sign errors, skipping formula declarations.' },
      { day: 17, title: 'PYQ Set 1 (Regular Exam 2024)', task: 'Attempt full Section B choice questions under timed conditions.' },
      { day: 18, title: 'Correction & Error Notebook', task: 'Create a "Mistake Log" for arithmetic slips and integration/differentiation slips.' },
      { day: 19, title: 'PYQ Set 2 (Supply Exam 2024)', task: 'Attempt supply paper. Supply papers test fundamental concepts directly.' },
      { day: 20, title: 'Compulsory Part-A Rapid Fire', task: 'Prepare answers for twenty 2-mark short questions across all 5 units.' },
      { day: 21, title: 'Speed Enhancement Practice', task: 'Aim to complete a 14-mark numerical problem in under 18 minutes.' },
      { day: 22, title: 'Confidence Re-Drill: Unit 1', task: 'Flawlessly re-solve the most difficult Unit 1 question with clean step layout.' },
      { day: 23, title: 'Confidence Re-Drill: Unit 2', task: 'Flawlessly re-solve the top Unit 2 problem. Box your final numerical answer.' },
      { day: 24, title: 'Full 3-Hour Mock Paper #1', task: 'Sit in a quiet room from 10:00 AM to 1:00 PM with official paper layout.' },
      { day: 25, title: 'Mock Paper #1 Evaluation', task: 'Calculate realistic external score. Check if you comfortably clear 35+ marks.' },
      { day: 26, title: 'Target Weak Sub-Topics', task: 'Spend 3 hours exclusively on the questions you skipped or botched in Mock #1.' },
      { day: 27, title: 'Full 3-Hour Mock Paper #2', task: 'Sit for second full mock using an older autonomous or university paper.' },
      { day: 28, title: 'Answer Sheet Presentation Audit', task: 'Practice neat margins, highlighted final formulas, boxed answers, clear headings.' },
      { day: 29, title: 'Final Formula & Theorem Scan', task: 'Only revise your 2-page master cheat sheet. No new concepts today.' },
      { day: 30, title: 'Pre-Exam Calm & Readiness', task: 'Verify hall ticket, non-programmable calculator fx-991CW, pens. Sleep 8 full hours.' }
    ]
  },
  {
    id: 'circuits',
    name: 'Hardware, Circuits & Electronics',
    example: 'Network Analysis, EDC, Analog Circuits, Control Systems, Signals & Systems',
    riskLevel: 'Moderate to High Backlog Rate (32%)',
    strategySummary:
      'Circuit diagrams and standard block diagrams carry up to 40% of the question marks even if final calculations have small arithmetic errors.',
    dayPlans: [
      { day: 1, title: 'Syllabus & Blueprint Mapping', task: 'Mark the 2 units containing circuit analysis (Thevenin, Norton, Two-Port networks).' },
      { day: 2, title: 'Master Circuit Diagram Sheet', task: 'Draw all 12 key circuit topologies on unruled paper with neat component labels.' },
      { day: 3, title: 'Unit 1: Network Theorems', task: 'Solve 4 standard circuit problems using Thevenin, Norton, and Superposition.' },
      { day: 4, title: 'Unit 1: AC Transient Analysis', task: 'Master R-L and R-C transient differential equations step-by-step.' },
      { day: 5, title: 'Unit 2: Active Components', task: 'Draw BJT/MOSFET small-signal hybrid-pi equivalent models cleanly.' },
      { day: 6, title: 'Unit 2: Transfer Characteristics', task: 'Master frequency response plots and gain-bandwidth derivation.' },
      { day: 7, title: 'Phase 1 Circuit Mock Test', task: 'Solve 2 full university numerical circuit problems in 40 minutes.' },
      { day: 8, title: 'Unit 3: Block Diagrams & Graphs', task: 'Master Mason’s Gain Formula and signal flow graph reductions.' },
      { day: 9, title: 'Unit 3: Stability Criteria', task: 'Practice Routh-Hurwitz array constructions and special case rows of zeros.' },
      { day: 10, title: 'Bode Plots & Root Locus', task: 'Practice standard sketch rules: asymptotes, breakaway points, imaginary crossings.' },
      { day: 11, title: 'Formula & Transfer Function Drill', task: 'Write all Laplace transform pairs and circuit impedance models.' },
      { day: 12, title: 'Unit 4: Operational Amplifiers', task: 'Derive inverting, non-inverting, integrator, and differentiator circuits.' },
      { day: 13, title: 'Unit 4: Filter Design', task: 'Learn 1st & 2nd order Butterworth filter design and cutoff calculations.' },
      { day: 14, title: 'Compulsory Part-A Concept Cards', task: 'Write concise definitions for Q-factor, bandwidth, CMRR, slew rate, poles/zeros.' },
      { day: 15, title: 'Mid-Way Assessment', task: 'Evaluate: Are your circuit diagrams neat and drawn with a pencil and ruler?' },
      { day: 16, title: 'PYQ 2023 Analysis', task: 'Attempt the highest-weightage numerical question from 2023 paper.' },
      { day: 17, title: 'PYQ 2024 Analysis', task: 'Solve the choice question from 2024 paper under strict timing.' },
      { day: 18, title: 'Circuit Equations Debugging', task: 'Check common KCL/KVL sign polarity mistakes at nodal junctions.' },
      { day: 19, title: 'Numerical Parameter Verification', task: 'Ensure you convert microfarads (µF), millihenries (mH), and kilohms (kΩ) accurately.' },
      { day: 20, title: 'State Variable Analysis Review', task: 'Solve 2 matrix state-space equation problems.' },
      { day: 21, title: 'Compulsory Short Answers Drill', task: 'Memorize standard 2-mark circuit condition statements.' },
      { day: 22, title: 'Top 3 Derivations Revision', task: 'Re-derive the 3 most common 10-mark questions from memory.' },
      { day: 23, title: 'High-Speed Diagram Drilling', task: 'Draw each major circuit schematic in under 2 minutes with zero hesitation.' },
      { day: 24, title: 'Full 3-Hour Mock Paper #1', task: 'Simulate university exam hall conditions from start to finish.' },
      { day: 25, title: 'Mock Paper Self-Scoring', task: 'Identify weak numerical units and re-solve any incorrect loops.' },
      { day: 26, title: 'Calculator Shortcuts Mastery', task: 'Use complex number mode (CMPLX) on fx-991CW to solve phasor circuits in 30s.' },
      { day: 27, title: 'Full 3-Hour Mock Paper #2', task: 'Complete a second past university paper with full focus.' },
      { day: 28, title: 'Paper Presentation Checklist', task: 'Use black pen for circuit lines, blue for text, pencil for graphs.' },
      { day: 29, title: 'Light Review of Formulas', task: 'Revise circuit theorems and gain formulas. No panic cramming.' },
      { day: 30, title: 'Ready for Exam', task: 'Prepare geometry instruments, approved calculator, hall ticket.' }
    ]
  },
  {
    id: 'programming',
    name: 'Programming & Core CS',
    example: 'Data Structures, Java, C++, DBMS, Operating Systems, Computer Networks',
    riskLevel: 'Moderate Backlog Rate (24%)',
    strategySummary:
      'Evaluators reward working pseudo-code, step-by-step dry-run traces, and clear architecture diagrams even for conceptual questions.',
    dayPlans: [
      { day: 1, title: 'Syllabus & Blueprint Audit', task: 'Identify the 2 units featuring concrete code/queries vs pure theoretical units.' },
      { day: 2, title: 'Master Algorithm & Syntax Sheet', task: 'Write standard syntax skeletons (class, structs, pointers, SQL template queries).' },
      { day: 3, title: 'Unit 1: Core Data Structures', task: 'Write bug-free C/Java code for Singly Linked List: insert, delete, and traverse.' },
      { day: 4, title: 'Unit 1: Stacks & Queues', task: 'Implement stack using array & linked list + Infix to Postfix dry run table.' },
      { day: 5, title: 'Unit 2: Trees & Traversals', task: 'Master Binary Search Tree insert/delete + Inorder, Preorder, Postorder traversals.' },
      { day: 6, title: 'Unit 2: Sorting & Searching', task: 'Write clean code for QuickSort, MergeSort, and Binary Search with step tracing.' },
      { day: 7, title: 'Phase 1 Code Test', task: 'Write 3 complete functions on paper without compiler assistance in 45 mins.' },
      { day: 8, title: 'Unit 3: Graphs & Shortest Path', task: 'Trace Dijkstra and Prim/Kruskal on a 5-node graph step-by-step with table.' },
      { day: 9, title: 'Unit 3: Dynamic Programming Core', task: 'Understand 0/1 Knapsack and LCS table generation by hand.' },
      { day: 10, title: 'Time & Space Complexity Proofs', task: 'Derive master theorem and asymptotic notation (Big-O, Omega, Theta).' },
      { day: 11, title: 'Unit 4: Core Architecture Diagrams', task: 'Draw clean diagrams: OS Architecture, DBMS 3-tier schema, or TCP/IP stack.' },
      { day: 12, title: 'Unit 4: Key Algorithms', task: 'Trace Banker’s Algorithm or Page Replacement (LRU, FIFO, Optimal) tables.' },
      { day: 13, title: 'Unit 5: SQL & Transaction Commands', task: 'Practice 10 essential SQL queries: JOINs, GROUP BY, HAVING, and Subqueries.' },
      { day: 14, title: 'Compulsory Part-A Concept Cards', task: 'Prepare short answers for 25 technical definitions across all modules.' },
      { day: 15, title: 'Mid-Way Code Assessment', task: 'Are your code snippets formatted with proper indentation and variable names?' },
      { day: 16, title: 'PYQ 2023 Paper Solve', task: 'Attempt the regular exam question paper on lined answer sheets.' },
      { day: 17, title: 'PYQ 2024 Paper Solve', task: 'Attempt the supply exam question paper.' },
      { day: 18, title: 'Dry Run Table Technique', task: 'Ensure every algorithm answer includes an explicit trace table with sample input.' },
      { day: 19, title: 'Corner Case Analysis', task: 'Learn how to mention boundary conditions (empty list, null pointer, array overflow).' },
      { day: 20, title: 'Re-Drill: Complex Trees', task: 'Practice AVL tree rotations (LL, RR, LR, RL) with clear diagrams.' },
      { day: 21, title: 'Part-A Speed Revision', task: 'Quiz yourself on 2-mark questions in under 15 minutes.' },
      { day: 22, title: 'High-Scoring Code Memorization', task: 'Practice writing 4 core algorithms until they can be produced in 5 mins.' },
      { day: 23, title: 'Architecture Diagram Cleanliness', task: 'Draw database ER-diagrams and system architecture with clean rectangular boxes.' },
      { day: 24, title: 'Full 3-Hour Mock Paper #1', task: 'Simulate complete 3-hour exam without looking at notes or screen.' },
      { day: 25, title: 'Mock Paper Review', task: 'Verify question choices. Always pick problems with code/numerical over pure theory.' },
      { day: 26, title: 'Target Weak Questions', task: 'Focus on the questions where you lost points in Mock #1.' },
      { day: 27, title: 'Full 3-Hour Mock Paper #2', task: 'Complete second university paper under exam pressure.' },
      { day: 28, title: 'Answer Sheet Layout Polish', task: 'Write comments in pseudo-code: `// Step 1: Initialize pointers` for readability.' },
      { day: 29, title: 'Final Syntax & Diagram Scan', task: 'Review summary flashcards and algorithm steps.' },
      { day: 30, title: 'Ready for Exam', task: 'Rest, hydrate, and approach the paper with a focused, methodical mindset.' }
    ]
  },
  {
    id: 'analytical',
    name: 'Core Analytical & Mechanics',
    example: 'Thermodynamics, Strength of Materials, Fluid Mechanics, Structural Analysis',
    riskLevel: 'High Backlog Rate (36%)',
    strategySummary:
      'Free Body Diagrams (FBD), state tables, and unit conversions (kN, MPa, mm) decide 70% of marks. A clean FBD secures half marks automatically.',
    dayPlans: [
      { day: 1, title: 'Syllabus & High-Weightage Chapters', task: 'Mark the 2 chapters containing guaranteed analytical numericals.' },
      { day: 2, title: 'Master Free Body Diagram (FBD) Rules', task: 'Practice drawing equilibrium FBDs with reactions and sign conventions.' },
      { day: 3, title: 'Unit 1: Stress-Strain / First Law', task: 'Solve 5 standard composite bar or closed system energy balance problems.' },
      { day: 4, title: 'Unit 1: Shear Force & Bending Moment', task: 'Draw SFD and BMD diagrams for simply supported and cantilever beams.' },
      { day: 5, title: 'Unit 2: Torsion & Second Law', task: 'Solve standard shaft power transmission or Carnot heat engine cycles.' },
      { day: 6, title: 'Unit 2: Bending Stress Formula', task: 'Master `M/I = sigma/y = E/R` calculations for I-sections and T-sections.' },
      { day: 7, title: 'Phase 1 Analytical Test', task: 'Solve 2 university numericals in 45 minutes with complete units indicated.' },
      { day: 8, title: 'Unit 3: Fluid Statics / Deflection', task: 'Practice Macaulays method or manometer pressure differential equations.' },
      { day: 9, title: 'Unit 3: Bernoulli & Energy Equations', task: 'Solve venturimeter and pipe flow friction loss numericals.' },
      { day: 10, title: 'Steam Tables & Mollier Chart Drill', task: 'Learn how to locate enthalpy, entropy, and dryness fraction in 30 seconds.' },
      { day: 11, title: 'Master Formula Compilation', task: 'Write all governing differential equations and constitutive laws.' },
      { day: 12, title: 'Unit 4: Columns & Struts / Vapor Cycles', task: 'Solve Rankine cycle with reheat or Euler’s critical buckling load.' },
      { day: 13, title: 'Unit 4: Thin Cylinders & Spheres', task: 'Calculate circumferential and longitudinal hoop stresses.' },
      { day: 14, title: 'Compulsory Part-A Quick Review', task: 'Memorize definitions: ductility, resilience, viscosity, enthalpy, entropy.' },
      { day: 15, title: 'Mid-Way Analytical Assessment', task: 'Check: Did you write units (N/mm², kPa, kJ/kg) next to EVERY single step?' },
      { day: 16, title: 'PYQ 2023 Numerical Solve', task: 'Attempt the highest-weightage problem from 2023 paper.' },
      { day: 17, title: 'PYQ 2024 Numerical Solve', task: 'Attempt the supply paper problem under timed conditions.' },
      { day: 18, title: 'Unit Conversion Drill', task: 'Practice conversions: 1 bar = 100 kPa = 10^5 N/m²; 1 MPa = 1 N/mm².' },
      { day: 19, title: 'SFD / BMD Precision Drafting', task: 'Draw SFD with straight lines, BMD with parabolic curves using ruler.' },
      { day: 20, title: 'Mohr’s Circle Graphical Technique', task: 'Master Mohr’s circle for principal stresses and maximum shear plane.' },
      { day: 21, title: 'Compulsory 2-Mark Question Drill', task: 'Write 15 concise 2-mark definitions.' },
      { day: 22, title: 'High-Weightage Re-Solve: Unit 1', task: 'Solve the toughest beam/cylinder problem cleanly.' },
      { day: 23, title: 'High-Weightage Re-Solve: Unit 2', task: 'Solve the core thermodynamic cycle or shaft problem.' },
      { day: 24, title: 'Full 3-Hour Mock Paper #1', task: 'Complete a full mock exam under strict 3-hour examination conditions.' },
      { day: 25, title: 'Mock Paper Self-Scoring', task: 'Calculate your marks. Verify if boundary conditions are clearly highlighted.' },
      { day: 26, title: 'Formula Memory Drill', task: 'Test formula recall on blank sheet of paper.' },
      { day: 27, title: 'Full 3-Hour Mock Paper #2', task: 'Complete second university paper.' },
      { day: 28, title: 'Presentation Audit', task: 'Box final numeric answer with units: e.g., `[ Bending Stress = 45.28 MPa ]`.' },
      { day: 29, title: 'Final Light Revision', task: 'Review summary charts and formula sheet. No heavy new problems.' },
      { day: 30, title: 'Ready for Exam', task: 'Ensure approved steam tables/charts, calculator, and hall ticket are packed.' }
    ]
  }
];

export const BacklogPlanner = () => {
  // Regulation & Marks Config
  const [regulation, setRegulation] = useState('r20'); // 'r20' (30/70) | 'r19' (40/60) | 'custom'
  const [internalTotal, setInternalTotal] = useState(30);
  const [externalTotal, setExternalTotal] = useState(70);
  const [internalsScored, setInternalsScored] = useState(14);
  const [subjectType, setSubjectType] = useState('maths');

  // Selected subject preset
  const currentPreset = useMemo(() => {
    return SUBJECT_PRESETS.find((p) => p.id === subjectType) || SUBJECT_PRESETS[0];
  }, [subjectType]);

  // Checkbox state persisted per subject
  const [checkedDays, setCheckedDays] = useState(() => {
    try {
      const saved = localStorage.getItem(`studymacha_backlog_plan_${subjectType}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reload checklist when subjectType changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`studymacha_backlog_plan_${subjectType}`);
      setCheckedDays(saved ? JSON.parse(saved) : []);
    } catch {
      setCheckedDays([]);
    }
  }, [subjectType]);

  // Save checklist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`studymacha_backlog_plan_${subjectType}`, JSON.stringify(checkedDays));
    } catch {
      // ignore
    }
  }, [checkedDays, subjectType]);

  // Adjust totals on regulation preset change
  const handleRegulationChange = (reg) => {
    setRegulation(reg);
    if (reg === 'r20') {
      setInternalTotal(30);
      setExternalTotal(70);
      setInternalsScored(14);
    } else if (reg === 'r19') {
      setInternalTotal(40);
      setExternalTotal(60);
      setInternalsScored(18);
    }
  };

  // Target calculations
  // Indian universities standard rule:
  // 1. Overall pass mark = 40% of (internalTotal + externalTotal), usually 40 out of 100
  // 2. Minimum external qualifying mark = 35% of externalTotal (e.g., 25 out of 70 for JNTU R20, or 21 out of 60 for R19)
  const totalMarks = internalTotal + externalTotal;
  const overallPassThreshold = Math.ceil(0.40 * totalMarks);
  const minExternalThreshold = Math.ceil(0.35 * externalTotal); // 35% minimum external rule

  // Target external marks required strictly to pass:
  const rawExternalForPass = overallPassThreshold - internalsScored;
  const externalToPass = Math.max(minExternalThreshold, rawExternalForPass);

  // Safe credit recovery target (50% overall to stay comfortably above re-eval border):
  const rawExternalForSafe = Math.ceil(0.50 * totalMarks) - internalsScored;
  const externalToSafe = Math.max(minExternalThreshold, Math.min(externalTotal, rawExternalForSafe));

  // First class target (60% overall):
  const rawExternalForFirstClass = Math.ceil(0.60 * totalMarks) - internalsScored;
  const externalToFirstClass = Math.max(minExternalThreshold, Math.min(externalTotal, rawExternalForFirstClass));

  // Is target realistically achievable?
  const isImpossible = externalToPass > externalTotal;
  const isDifficult = externalToPass > externalTotal * 0.75;

  // Toggle single checklist day
  const toggleDay = (dayNum) => {
    setCheckedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  // Reset checklist
  const handleResetChecklist = () => {
    if (window.confirm('Reset all 30 days progress for this subject plan?')) {
      setCheckedDays([]);
    }
  };

  // Print study plan
  const handlePrintPlan = () => {
    window.print();
  };

  const completionPercentage = Math.round((checkedDays.length / 30) * 100);

  return (
    <div id="backlog-planner-root" className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/60 to-slate-950 text-white p-6 sm:p-8 border border-rose-900/30 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Credit Recovery &amp; Pass-Mark Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Smart Backlog Recovery Planner</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Calculate minimum external pass marks and follow an interactive 30-day subject revision roadmap.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="text-center px-2">
              <div className="text-2xl font-black text-rose-400">{checkedDays.length}/30</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Days Cleared</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-2xl font-black text-emerald-400">{completionPercentage}%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Readiness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Matrix & Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Configuration Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-rose-500" />
              <span>1. Exam Regulation &amp; Marks</span>
            </h3>

            {/* Regulation presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                University / Regulation Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'r20', label: 'R20/R23 (30:70)' },
                  { id: 'r19', label: 'R16/R19 (40:60)' },
                  { id: 'custom', label: 'Custom' }
                ].map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleRegulationChange(reg.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      regulation === reg.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom inputs if needed */}
            {regulation === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Internal Max</label>
                  <input
                    type="number"
                    value={internalTotal}
                    onChange={(e) => setInternalTotal(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">External Max</label>
                  <input
                    type="number"
                    value={externalTotal}
                    onChange={(e) => setExternalTotal(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            )}

            {/* Mid / Internal Marks Scored Slider + Input */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="internals-scored-input" className="font-bold text-slate-700 dark:text-slate-300">
                  Mid/Internals Scored (out of {internalTotal})
                </label>
                <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                  {internalsScored} / {internalTotal}
                </span>
              </div>
              <input
                id="internals-scored-input"
                type="range"
                min={0}
                max={internalTotal}
                value={internalsScored}
                onChange={(e) => setInternalsScored(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (Worst case)</span>
                <span>Average: {Math.round(internalTotal * 0.5)}</span>
                <span>{internalTotal} (Full)</span>
              </div>
            </div>

            {/* Subject Type Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Select Subject Archetype
              </label>
              <div className="space-y-2">
                {SUBJECT_PRESETS.map((p) => {
                  const isSelected = subjectType === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSubjectType(p.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                          {p.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {p.example}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Computed Targets & Strategic Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Output Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target 1: Bare Minimum Pass */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Minimum Pass Cutoff
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {externalToPass}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ {externalTotal} Marks</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Needed to clear 40% aggregate &amp; satisfy 35% external qualifying rule ({minExternalThreshold}+).
              </p>
            </div>

            {/* Target 2: Safe Recovery (50%) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                Safe Credit Target (B Grade)
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-500">
                  {externalToSafe}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ {externalTotal} Marks</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Guarantees pass even with strict university correction &amp; avoids re-evaluation margins.
              </p>
            </div>

            {/* Target 3: First Class (60%) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                First Class Target (60%)
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {externalToFirstClass}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ {externalTotal} Marks</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Secures high grade points to raise overall CGPA back to 6.5+ for campus placement eligibility.
              </p>
            </div>
          </div>

          {/* Special Caution or Strategic Advice */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>Subject Doctrine: {currentPreset.name}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentPreset.strategySummary}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 border-t border-slate-800">
              <span>• Internal: <strong>{internalsScored}/{internalTotal}</strong></span>
              <span>• External Target: <strong>{externalToPass}/{externalTotal}</strong></span>
              <span>• Projected Total: <strong>{internalsScored + externalToPass}/{totalMarks} (Pass)</strong></span>
            </div>
          </div>

          {/* Interactive 30-Day Revision Checklist Header & Actions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>30-Day Day-by-Day Revision Checklist</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tasks persist automatically in your browser storage. Check off items daily.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPlan}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Plan</span>
                </button>
              </div>
            </div>

            {/* Checklist Day-by-Day Accordion / Cards */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {currentPreset.dayPlans.map((item) => {
                const isChecked = checkedDays.includes(item.day);
                return (
                  <div
                    key={item.day}
                    onClick={() => toggleDay(item.day)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded ${
                            isChecked
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Day {item.day}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.task}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogPlanner;
