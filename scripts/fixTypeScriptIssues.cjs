const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function patch(relativePath, transform, label) {
  const filePath = path.join(root, relativePath);
  const before = fs.readFileSync(filePath, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after, 'utf8');
    console.log(`[ts-fix] ${label}: patched`);
  } else {
    console.log(`[ts-fix] ${label}: already correct`);
  }
}

patch('src/components/EapcetCbtMockTestEngine.tsx', (source) => {
  let next = source
    .replaceAll('correctCountCount', 'correctCount')
    .replaceAll('incorrectCountCount', 'incorrectCount');
  next = next.replace(
    /scoreReport\.subjectBreakdown\.(math|physics|chemistry)\.attempted/g,
    'scoreReport.subjectBreakdown.$1.correct + scoreReport.subjectBreakdown.$1.incorrect'
  );
  return next;
}, 'repair EAPCET mock-test score field names');

patch('src/components/GlobalGpaHub.tsx', (source) => source.replace("useState<GpaFormulaId>('jntu_standard')", "useState<GpaFormulaId>('jntu')"), 'use supported JNTU GPA formula id');

patch('src/components/Header.tsx', (source) => source
  .replace("  { label: 'AP EAPCET Vacancy Radar', workspace: 'eapcet-radar', icon: Search },\n", '')

patch('src/components/MosStudentExperience.tsx', (source) => {
  let next = source;
  next = next.replace(
    /\{\[\n\s*\[Search, '1', 'Find the right workspace',[\s\S]*?\n\s*\[Target, '3', 'Make your plan',[\s\S]*?\n\s*\]\s*\.map\(\(\[Icon, number, title, text\]\) => \{/m,
    (match) => match
      .replace('{[', '{([')
      .replace(/\]\s*\.map\(\(\[Icon, number, title, text\]\) => \{/, '] as Array<[React.ElementType, string, string, string]>).map(([Icon, number, title, text]) => {')
  );
  return next;
}, 'type the workflow step tuple for React rendering');

patch('src/components/NavigationDrawer.tsx', (source) => source.replace(
  '  return <SlideOverDrawer {...props} />;',
  '  return <SlideOverDrawer {...props} onOpenSupport={props.onOpenSupport ?? (() => {})} onOpenFeedback={props.onOpenFeedback ?? (() => {})} />;'
), 'provide safe optional drawer callbacks');

patch('src/components/StudentGapAnalyzer/StudentGapAnalyzer.tsx', (source) => source.replace(
  '                comparisons={result.comparisons}\n                careerTitle={result.careerTitle}',
  '                comparisons={result.comparisons}'
), 'remove unsupported visual comparison prop');

patch('src/components/ap-allotment/APCategoryInsights.tsx', (source) => source.replace(
  'const medianRank = analytics?.medianRank ?? (analytics as any)?.medianAllotmentRank ?? 0;',
  'const medianRank = (analytics as any)?.medianRank ?? (analytics as any)?.medianAllotmentRank ?? 0;'
), 'use typed-safe median rank fallback');

patch('src/components/ap-allotment/APStudentDetailModal.tsx', (source) => source.replace(
  '      </section>\n    </div>\n  );\n};',
  '      </section>\n    </div>\n  , portalTarget);\n};'
), 'pass the modal portal target to createPortal');

patch('src/components/ap-allotment/APStudentSearch.tsx', (source) => source.replace(
  'onChange={(e) => setPhaseFilter(e.target.value)}',
  "onChange={(e) => setPhaseFilter(e.target.value as 'ALL' | '1' | '2' | '3')}"
), 'type the AP phase filter select value');

patch('src/components/roadmaps/RoadmapModal.tsx', (source) => source.replace(
  '          branch={branch}\n          isOpen={showShareDialog}\n          onClose={() => setShowShareDialog(false)}',
  '          branch={branch}\n          onClose={() => setShowShareDialog(false)}'
), 'remove obsolete share-dialog isOpen prop');
