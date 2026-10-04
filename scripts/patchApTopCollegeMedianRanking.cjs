const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'src', 'components', 'ApTopColleges.jsx');

if (!fs.existsSync(target)) {
  console.log('[ap-top-ranking] Component not present; skipping UI patch.');
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');
let changed = false;

const replaceOnce = (from, to, label) => {
  if (!source.includes(from)) return;
  source = source.replace(from, to);
  changed = true;
  console.log(`[ap-top-ranking] ${label}`);
};

replaceOnce(
  "const [sortBy, setSortBy] = useState('fill_desc');",
  "const [sortBy] = useState('median_asc');",
  'locked ranking mode to median_asc'
);

const sortPanelStart = '          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">';
const sortPanelEnd = '          </div>\n        </section>\n\n        {/* Summary Metric Cards */';
const start = source.indexOf(sortPanelStart);
const end = source.indexOf(sortPanelEnd, start);

if (start >= 0 && end >= 0) {
  const replacement = `          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Ranking method:</span>
              <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 font-bold text-cyan-700 dark:text-cyan-300">
                Median OC rank · Lowest first
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Search and filters preserve each college's original overall rank.
              </span>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-slate-200">{rows.length}</strong> matching institutions
            </span>
          </div>
        </section>

        {/* Summary Metric Cards */`;
  source = source.slice(0, start) + replacement + source.slice(end + sortPanelEnd.length);
  changed = true;
  console.log('[ap-top-ranking] replaced dynamic sort controls with fixed median ranking notice');
}

replaceOnce(
  'Compare observed 2026 AP EAPCET college and branch rank patterns using opening rank, median rank, closing rank, seat capacity, seats filled, and transparent rank-threshold allotment counts.',
  'Rank observed AP EAPCET 2026 colleges by median OC allotment rank only. Opening/closing ranks, seat data, and rank-threshold counts are shown as supporting context, not ranking factors.',
  'updated ranking methodology copy'
);

if (changed) {
  fs.writeFileSync(target, source, 'utf8');
} else {
  console.log('[ap-top-ranking] UI already matches the median-only ranking contract.');
}
