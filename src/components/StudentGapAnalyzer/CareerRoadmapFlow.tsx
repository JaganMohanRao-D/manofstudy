import React from 'react';
import { RoadmapMilestone } from '../../data/careerRequirementsData';
import { Compass, CheckCircle2, Clock, Award } from 'lucide-react';

interface CareerRoadmapFlowProps {
  careerTitle: string;
  roadmap: RoadmapMilestone[];
  studentYear: string;
}

export const CareerRoadmapFlow: React.FC<CareerRoadmapFlowProps> = ({
  careerTitle,
  roadmap,
  studentYear,
}) => {
  // Approximate active stage based on student year:
  // 1st Year: Stage 1-2
  // 2nd Year: Stage 3-4
  // 3rd Year: Stage 4-5
  // 4th Year: Stage 5-6
  const getActiveStageNumber = (year: string) => {
    if (year === '1st Year') return 2;
    if (year === '2nd Year') return 3;
    if (year === '3rd Year') return 4;
    return 5;
  };

  const activeStage = getActiveStageNumber(studentYear);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-500" />
            <span>Personalized Career Roadmap: {careerTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step milestone path from foundational concepts to campus placement and industry readiness.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold">
            Target: {careerTitle}
          </span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {roadmap.map((stage) => {
          const isCompleted = stage.stageNumber < activeStage;
          const isCurrent = stage.stageNumber === activeStage;

          return (
            <div key={stage.stageNumber} className="relative space-y-2">
              {/* Bullet Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/70'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[11px] font-extrabold">{stage.stageNumber}</span>
                )}
              </div>

              {/* Stage Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Stage {stage.stageNumber}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      {stage.title}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
                        Current Position ({studentYear})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{stage.estimatedTime}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {stage.focusArea}
                </p>

                {/* Skills Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {stage.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Deliverable Box */}
                <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2 text-xs">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Milestone Output: </span>
                    <span className="text-slate-600 dark:text-slate-400">{stage.deliverable}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
