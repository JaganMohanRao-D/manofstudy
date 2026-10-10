import React, { useMemo, useState } from 'react';
import { Award, Calculator, AlertTriangle, Info, RotateCcw, TrendingUp } from 'lucide-react';

type Category = 'OC' | 'BC' | 'EWS' | 'SC' | 'ST';
type BoardType = 'bieap' | 'other';

export interface EapcetRankInputs {
  category: Category;
  mathematics: number;
  physics: number;
  chemistry: number;
  boardType: BoardType;
  boardMarks: number;
}

export interface EapcetRankResult {
  status: 'QUALIFIED' | 'NOT_QUALIFIED';
  eapcetRawScore: number;
  eapcetWeightage: number;
  boardWeightage: number;
  combinedScore: number | null;
  predictedMinRank: number | null;
  predictedMaxRank: number | null;
  estimatedRank: number | null;
  message: string;
}

// These score/rank anchors are the supplied calibration dataset, not official cutoff data.
const RANK_ANCHORS: Array<{ score: number; min: number; max: number }> = [
  { score: 90, min: 1, max: 300 },
  { score: 85, min: 300, max: 1000 },
  { score: 80, min: 1000, max: 2500 },
  { score: 75, min: 2500, max: 5000 },
  { score: 70, min: 5000, max: 9000 },
  { score: 65, min: 9000, max: 15000 },
  { score: 60, min: 15000, max: 24000 },
  { score: 55, min: 24000, max: 36000 },
  { score: 50, min: 36000, max: 51000 },
  { score: 47.5, min: 51000, max: 60000 },
  { score: 45, min: 72000, max: 80000 },
  { score: 44, min: 80000, max: 92000 },
  { score: 43, min: 92000, max: 115000 },
  { score: 42, min: 115000, max: 140000 },
  { score: 41, min: 140000, max: 165000 },
  { score: 40, min: 165000, max: 180000 },
  { score: 35, min: 180000, max: 200000 },
  { score: 31.7, min: 195000, max: 215000 },
  { score: 28, min: 215000, max: 240000 },
  { score: 20, min: 240000, max: 280000 },
];

const round3 = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;

export function predictEapcetRank(inputs: EapcetRankInputs): EapcetRankResult {
  const eapcetRawScore = inputs.mathematics + inputs.physics + inputs.chemistry;
  const boardMax = inputs.boardType === 'bieap' ? 600 : 300;
  const eapcetWeightage = round3((eapcetRawScore / 160) * 75);
  const boardWeightage = round3((inputs.boardMarks / boardMax) * 25);
  const combinedScore = round3(eapcetWeightage + boardWeightage);
  const requiresForty = inputs.category !== 'SC' && inputs.category !== 'ST';

  if (requiresForty && eapcetRawScore < 40) {
    return {
      status: 'NOT_QUALIFIED',
      eapcetRawScore,
      eapcetWeightage,
      boardWeightage,
      combinedScore: null,
      predictedMinRank: null,
      predictedMaxRank: null,
      estimatedRank: null,
      message: 'For OC, BC and EWS categories, the supplied qualification rule requires at least 40 out of 160 raw EAPCET marks. Intermediate marks do not override this requirement.',
    };
  }

  const anchors = [...RANK_ANCHORS].sort((a, b) => b.score - a.score);
  let lower: (typeof anchors)[number] | undefined;
  let upper: (typeof anchors)[number] | undefined;

  for (let i = 0; i < anchors.length - 1; i++) {
    if (combinedScore <= anchors[i].score && combinedScore >= anchors[i + 1].score) {
      upper = anchors[i];
      lower = anchors[i + 1];
      break;
    }
  }

  if (!upper || !lower) {
    return {
      status: 'QUALIFIED',
      eapcetRawScore,
      eapcetWeightage,
      boardWeightage,
      combinedScore,
      predictedMinRank: null,
      predictedMaxRank: null,
      estimatedRank: null,
      message: 'Your combined score is outside the supplied calibration range (20–90). A rank estimate is not provided because no anchor was supplied for this score.',
    };
  }

  const ratio = (upper.score - combinedScore) / (upper.score - lower.score);
  const predictedMinRank = Math.max(1, Math.round(upper.min + (lower.min - upper.min) * ratio));
  const predictedMaxRank = Math.max(predictedMinRank, Math.round(upper.max + (lower.max - upper.max) * ratio));
  const estimatedRank = Math.round((predictedMinRank + predictedMaxRank) / 2);

  return {
    status: 'QUALIFIED',
    eapcetRawScore,
    eapcetWeightage,
    boardWeightage,
    combinedScore,
    predictedMinRank,
    predictedMaxRank,
    estimatedRank,
    message: 'This is an indicative estimate from the supplied piecewise-linear score/rank anchors. Actual ranks can vary with the exam year, shift normalization and candidate distribution.',
  };
}

const numberFormat = (value: number) => Math.round(value).toLocaleString('en-IN');
const scoreFormat = (value: number) => value.toFixed(3);

const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const labelClass = 'block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300';

export default function ApEapcetRankPredictor() {
  const [category, setCategory] = useState<Category>('OC');
  const [mathematics, setMathematics] = useState('40');
  const [physics, setPhysics] = useState('20');
  const [chemistry, setChemistry] = useState('20');
  const [boardType, setBoardType] = useState<BoardType>('bieap');
  const [boardMarks, setBoardMarks] = useState('480');
  const [submitted, setSubmitted] = useState(false);

  const boardMax = boardType === 'bieap' ? 600 : 300;
  const subjectValues = [mathematics, physics, chemistry];
  const subjectMaxima = [80, 40, 40];
  const subjectNumbers = subjectValues.map((value) => value === '' ? NaN : Number(value));
  const boardNumber = boardMarks === '' ? NaN : Number(boardMarks);
  const formError = subjectNumbers.some((value, i) => !Number.isFinite(value) || value < 0 || value > subjectMaxima[i])
    ? 'Enter valid subject marks within the maximum shown for each subject.'
    : !Number.isFinite(boardNumber) || boardNumber < 0 || boardNumber > boardMax
      ? `Enter board marks between 0 and ${boardMax}.`
      : '';

  const result = useMemo(() => {
    if (!submitted || formError) return null;
    return predictEapcetRank({
      category,
      mathematics: subjectNumbers[0],
      physics: subjectNumbers[1],
      chemistry: subjectNumbers[2],
      boardType,
      boardMarks: boardNumber,
    });
  }, [submitted, formError, category, mathematics, physics, chemistry, boardType, boardMarks]);

  const reset = () => {
    setCategory('OC');
    setMathematics('40');
    setPhysics('20');
    setChemistry('20');
    setBoardType('bieap');
    setBoardMarks('480');
    setSubmitted(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-5 shadow-sm dark:border-cyan-900/60 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/30 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-cyan-800 dark:border-cyan-800 dark:bg-slate-900/80 dark:text-cyan-300">
              <TrendingUp className="h-3.5 w-3.5" /> AP EAPCET · Engineering
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">AP EAPCET Rank Predictor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Estimate a rank range from your EAPCET subject marks and Intermediate/board marks using the supplied 75:25 weighting and calibration anchors.</p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-white text-cyan-700 shadow-sm dark:border-cyan-800 dark:bg-slate-900 dark:text-cyan-300">
            <Calculator className="h-7 w-7" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.82fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Enter your marks</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">All fields are required for an estimate.</p>
            </div>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass} htmlFor="ap-rank-category">Candidate category</label>
              <select id="ap-rank-category" className={fieldClass} value={category} onChange={(event) => { setCategory(event.target.value as Category); setSubmitted(false); }}>
                <option value="OC">OC — Open Category</option>
                <option value="BC">BC — Backward Class</option>
                <option value="EWS">EWS — Economically Weaker Section</option>
                <option value="SC">SC — Scheduled Caste</option>
                <option value="ST">ST — Scheduled Tribe</option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">EAPCET subject marks</h3><span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Out of 160</span></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {([
                  { id: 'ap-rank-maths', title: 'Mathematics', max: 80, value: mathematics, set: setMathematics },
                  { id: 'ap-rank-physics', title: 'Physics', max: 40, value: physics, set: setPhysics },
                  { id: 'ap-rank-chemistry', title: 'Chemistry', max: 40, value: chemistry, set: setChemistry },
                ] as const).map((subject) => (
                  <div key={subject.id}>
                    <label className={labelClass} htmlFor={subject.id}>{subject.title} <span className="normal-case tracking-normal text-slate-400">(max {subject.max})</span></label>
                    <input id={subject.id} className={fieldClass} type="number" min="0" max={subject.max} step="1" inputMode="numeric" value={subject.value} onChange={(event) => { subject.set(event.target.value); setSubmitted(false); }} />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Raw EAPCET score: <strong className="text-slate-800 dark:text-slate-100">{subjectNumbers.every(Number.isFinite) ? subjectNumbers.reduce((sum, value) => sum + value, 0) : '—'}</strong> / 160</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="ap-rank-board">Intermediate / board type</label>
              <select id="ap-rank-board" className={fieldClass} value={boardType} onChange={(event) => { setBoardType(event.target.value as BoardType); setSubmitted(false); }}>
                <option value="bieap">AP Intermediate (BIEAP) — group total / 600</option>
                <option value="other">CBSE / Other Board — PCM total / 300</option>
              </select>
              <label className={`${labelClass} mt-4`} htmlFor="ap-rank-board-marks">{boardType === 'bieap' ? 'Group marks obtained' : 'PCM marks obtained'} <span className="normal-case tracking-normal text-slate-400">(max {boardMax})</span></label>
              <input id="ap-rank-board-marks" className={fieldClass} type="number" min="0" max={boardMax} step="1" inputMode="numeric" value={boardMarks} onChange={(event) => { setBoardMarks(event.target.value); setSubmitted(false); }} />
            </div>
            {formError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{formError}</p>}
            <button type="button" disabled={Boolean(formError)} onClick={() => setSubmitted(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-600/15 transition hover:from-cyan-700 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-50"><Calculator className="h-4 w-4" /> Calculate estimated rank</button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:p-6" aria-live="polite">
          {!result ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-white text-cyan-700 dark:border-cyan-900 dark:bg-slate-950 dark:text-cyan-300"><Award className="h-7 w-7" /></div>
              <h2 className="mt-4 text-base font-black text-slate-900 dark:text-white">Your estimate will appear here</h2>
              <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">Enter your marks and calculate to see qualification status, weighted score and the estimated rank range.</p>
            </div>
          ) : result.status === 'NOT_QUALIFIED' ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/70 dark:bg-rose-950/30">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <div><p className="text-sm font-black text-rose-800 dark:text-rose-300">Not qualified under the supplied rule</p><p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-300">{result.message}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Raw EAPCET</p><p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{result.eapcetRawScore}<span className="text-xs font-semibold text-slate-400"> / 160</span></p></div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Required</p><p className="mt-1 text-xl font-black text-rose-600 dark:text-rose-400">40 / 160</p></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300"><Award className="h-5 w-5" /><p className="text-sm font-black">Qualification status: Qualified</p></div>
                <p className="mt-1 text-xs leading-5 text-emerald-800/90 dark:text-emerald-300/90">{result.message}</p>
              </div>
              {result.predictedMinRank !== null && result.predictedMaxRank !== null && result.estimatedRank !== null ? (
                <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm dark:border-cyan-900/70 dark:bg-slate-950">
                  <p className="text-[10px] font-black uppercase tracking-[.15em] text-cyan-700 dark:text-cyan-300">Estimated rank range</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">{numberFormat(result.predictedMinRank)} <span className="text-slate-400">–</span> {numberFormat(result.predictedMaxRank)}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200"><TrendingUp className="h-3.5 w-3.5" /> Midpoint estimate: {numberFormat(result.estimatedRank)}</div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30"><p className="text-sm font-black text-amber-800 dark:text-amber-300">Rank range unavailable</p><p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">{result.message}</p></div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'EAPCET weightage', value: scoreFormat(result.eapcetWeightage), detail: 'Out of 75', tint: 'text-sky-700 dark:text-sky-300' },
                  { label: 'Board weightage', value: scoreFormat(result.boardWeightage), detail: 'Out of 25', tint: 'text-violet-700 dark:text-violet-300' },
                  { label: 'Combined score', value: result.combinedScore === null ? '—' : scoreFormat(result.combinedScore), detail: 'Out of 100', tint: 'text-cyan-700 dark:text-cyan-300' },
                ].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"><p className="text-[10px] font-bold uppercase leading-4 tracking-wide text-slate-500">{item.label}</p><p className={`mt-2 text-xl font-black ${item.tint}`}>{item.value}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{item.detail}</p></div>)}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/70"><Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" /><p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">Estimate only — not an official rank or counselling result. Shift normalization, year-wise candidate performance and official rules may affect the actual result. The rank curve uses the supplied calibration anchors and piecewise-linear interpolation.</p></div>
        </section>
      </div>
    </div>
  );
}
