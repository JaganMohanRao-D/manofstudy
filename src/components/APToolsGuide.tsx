import React from 'react';
import type { WorkspaceView } from '../types';

type Guide = { title: string; intro: string; sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }> };
const guides: Partial<Record<WorkspaceView, Guide>> = {
 'ap-allotments': { title: 'AP EAPCET allotment records: complete student guide', intro: 'Explore historical college and branch outcomes as a starting point for admission research.', sections: [
  { heading: 'What records mean', paragraphs: ['An allotment record describes a counselling outcome represented in the dataset available to this tool. Depending on the source record, it may include college, branch, rank and category information.', 'Historical records describe their own year and phase. They do not guarantee the same result in a future year because seats, preferences and rules can change.'] },
  { heading: 'Search and compare carefully', paragraphs: ['Start broadly, then select a college, branch or other supported filter. If there are no results, clear filters one at a time. Compare only records from comparable years, phases, branches and categories; a rank is not a universal cutoff.'] },
  { heading: 'Use results responsibly', paragraphs: ['Use the explorer to shortlist colleges and research them independently. Verify current seat matrices, eligibility, college codes, fees and deadlines with official AP EAPCET counselling information. The tool cannot confirm live vacancies or guarantee admission.', 'If candidate-level details are displayed, use them only for legitimate educational research and avoid republishing personal information.'] }
 ] },
 'ap-predictor': { title: 'AP EAPCET college predictor: complete student guide', intro: 'Understand rank-based matches as research suggestions, not admission promises.', sections: [
  { heading: 'How it works', paragraphs: ['The predictor compares your rank and supported preferences with the historical allotment data available to Naa College and presents options for further research. It does not allocate seats or participate in official counselling.', 'Historical comparisons cannot reproduce every future factor, including applicant preferences, current seat availability and rule changes.'] },
  { heading: 'Enter accurate preferences', paragraphs: ['Enter your rank carefully and choose the category, gender, region and other supported options that accurately describe your profile. Do not choose a category simply to get more matches; eligibility is determined by official rules and valid documents.', 'A match is an option to investigate, not a guaranteed seat, live vacancy or future cutoff.'] },
  { heading: 'Turn results into a shortlist', paragraphs: ['Compare the specific branch, curriculum, location, total cost, transport or hostel needs and credible college information. Build a balanced preference list containing options you would genuinely consider, and order them according to your priorities and official option-entry rules.', 'Confirm the current schedule, seat matrix, eligibility, fees, college and branch codes on official sources. The predictor does not register you or submit web options.'] }
 ] },
 'ap-web-options': { title: 'AP EAPCET web options builder: complete student guide', intro: 'Organise and review your college-branch preferences before using the official counselling portal.', sections: [
  { heading: 'What web options are', paragraphs: ['Web options are the college and branch preferences a candidate submits through the official counselling process. Preference order matters under the published counselling rules. A planning builder can help organise a draft but cannot reserve a seat or replace the official portal.'] },
  { heading: 'Build a preference list around your needs', paragraphs: ['Decide which branches, locations, fees and campus conditions are acceptable. Research each college and place options in the order you would actually prefer them—not simply in a predictor’s order. Include only options you would be prepared to accept.', 'Check college and branch codes carefully so you do not accidentally select a different option.'] },
  { heading: 'Review before submission', paragraphs: ['Verify the current seat matrix, codes, fees, eligibility and option-entry instructions. Deadlines and editing windows can vary by year and phase, so follow the official AP EAPCET counselling portal.', 'A draft is not a submitted option list. Keep a copy of the final list and official confirmation when available.'] }
 ] },
 'ap-rank-predictor': { title: 'AP EAPCET rank predictor: complete student guide', intro: 'Use estimated rank ranges for early exploration, then rely on your official rank card.', sections: [
  { heading: 'What a rank estimate means', paragraphs: ['A rank predictor estimates a possible range from the inputs and assumptions used by its model. It can help you begin researching colleges before results, but it cannot know the official result, full candidate distribution or every scoring and normalisation factor.', 'The official rank card and admissions authority are the authoritative sources for your actual rank.'] },
  { heading: 'Check your inputs', paragraphs: ['Enter marks and requested details exactly as instructed. Do not confuse raw marks, percentages and mock-test scores. Read the full estimated range rather than treating one number as certain.', 'Use the estimate only to explore a broad range of possibilities. Update your research when official results and counselling information are released.'] },
  { heading: 'Avoid overconfidence', paragraphs: ['An estimate is not an official rank, cutoff or admission guarantee. Do not make irreversible decisions based only on an estimate; use official rank information, current seat matrices and eligibility rules when planning your options.'] }
 ] },
 'ap-top-colleges': { title: 'AP B.Tech colleges and observed ranks: complete guide', intro: 'Use historical rank information alongside academic, financial and personal priorities.', sections: [
  { heading: 'How to read observed ranks', paragraphs: ['Observed ranks summarise records from the dataset and context shown. Check the year, phase, branch and category before comparing values. They are not a universal measure of college quality and do not guarantee future cutoffs.'] },
  { heading: 'Look beyond a single number', paragraphs: ['Compare the specific branch, curriculum, learning support, location, travel or hostel needs, total fees, scholarships and your own comfort. Interpret placement claims carefully by checking the year, student group, role types and whether the figure is a median or average.', 'No one college is best for every student. Your budget, branch interest and personal priorities should guide your shortlist.'] },
  { heading: 'Verify current information', paragraphs: ['Confirm courses, fees, codes, approvals where relevant and current counselling information using official college and AP EAPCET sources. Historical data may be incomplete or outdated and cannot confirm current vacancies.', 'Create a balanced shortlist and order web options according to your real preferences and the official instructions.'] }
 ] }
};
export const APToolsGuide: React.FC<{ toolId: WorkspaceView }> = ({ toolId }) => {
 const guide = guides[toolId]; if (!guide) return null;
 return <section aria-labelledby="ap-tool-guide-title" className="mt-8 space-y-5">
  <header className="rounded-3xl border border-blue-100 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900 p-6 sm:p-8">
   <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Naa College · AP EAPCET learning guide</p>
   <h2 id="ap-tool-guide-title" className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">{guide.title}</h2>
   <p className="mt-3 max-w-4xl text-sm sm:text-base leading-7 text-slate-700 dark:text-slate-300">{guide.intro}</p>
  </header>
  {guide.sections.map((section) => <article key={section.heading} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7">
   <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">{section.heading}</h3>
   <div className="mt-3 space-y-3">{section.paragraphs.map((paragraph, index) => <p key={index} className="text-sm leading-7 text-slate-600 dark:text-slate-300">{paragraph}</p>)}</div>
   {section.bullets && <ul className="mt-4 list-disc pl-5 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
  </article>)}
  <p className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm leading-6 text-amber-950 dark:text-amber-100"><strong>Important:</strong> These tools are educational aids. They do not guarantee rank, admission or allotment. Verify current details with the official AP EAPCET counselling authority.</p>
 </section>;
};
