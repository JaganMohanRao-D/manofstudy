const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'src', 'components', 'SiteUxFixes.tsx');
let source = fs.readFileSync(file, 'utf8');

if (!source.includes('MOS_REGIONAL_THEME_V2')) {
  source = source.replace(
`  const viewportText = document.getElementById('workspace-viewport')?.textContent?.toLowerCase() || '';
  if (viewportText.includes('tg eapcet') || viewportText.includes('telangana')) return 'tg';
  if (viewportText.includes('ap eapcet') || viewportText.includes('andhra pradesh')) return 'ap';
  return null;`,
`  // Regional visuals are route-scoped only. Never infer AP/TG from page text,
  // because unrelated tools can mention AP/TG in their content.
  return null;`
  );

  source = source.replace(
`const getRegionalImagePath = (region: 'ap' | 'tg') => region === 'tg'`,
`const getRegionalImagePath = (region: 'ap' | 'tg') => region === 'tg'`
  );

  const marker = `const SiteUxFixes: React.FC = () => {`;
  const helpers = `/* MOS_REGIONAL_THEME_V2 */
const syncRegionalTheme = () => {
  if (typeof window === 'undefined') return null;
  const region = getRegionalWorkspace();
  const regional = region !== null;
  const root = document.documentElement;
  root.classList.toggle('dark', !regional);
  root.classList.toggle('light', regional);
  root.setAttribute('data-theme', regional ? 'light' : 'dark');
  root.style.colorScheme = regional ? 'light' : 'dark';
  document.body.classList.toggle('mos-regional-light', regional);
  document.body.classList.toggle('mos-dark-only', !regional);
  return region;
};

`;
  source = source.replace(marker, helpers + marker);

  source = source.replace(
`  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';
    document.body.classList.add('mos-dark-only');`,
`  useEffect(() => {
    syncRegionalTheme();`
  );

  source = source.replace(
`      [title^="Switch to "] { display:none !important; }`,
`      [title^="Switch to "] { display:none !important; }

      /* MOS_REGIONAL_THEME_V2: AP/TG workspaces are the only bright-theme routes. */
      body.mos-regional-light { background:#f5f7fb !important; color:#172033 !important; }
      body.mos-regional-light #workspace-viewport { background:#f5f7fb !important; color:#172033 !important; }
      body.mos-regional-light #workspace-viewport [class*="dark:bg-"] { background-color:#ffffff !important; }
      body.mos-regional-light #workspace-viewport [class*="bg-slate-950"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-900"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-800"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-700"] { background-color:#ffffff !important; }
      body.mos-regional-light #workspace-viewport [class*="dark:text-white"],
      body.mos-regional-light #workspace-viewport [class*="dark:text-slate-50"],
      body.mos-regional-light #workspace-viewport [class*="dark:text-slate-100"],
      body.mos-regional-light #workspace-viewport [class*="dark:text-slate-200"],
      body.mos-regional-light #workspace-viewport [class*="dark:text-slate-300"] { color:#172033 !important; }
      body.mos-regional-light #workspace-viewport [class*="dark:text-slate-400"],
      body.mos-regional-light #workspace-viewport [class*="dark:text-slate-500"] { color:#526071 !important; }
      body.mos-regional-light #workspace-viewport [class*="dark:border-"] { border-color:#d7dee8 !important; }
      body.mos-regional-light #workspace-viewport input,
      body.mos-regional-light #workspace-viewport select,
      body.mos-regional-light #workspace-viewport textarea { background:#ffffff !important; color:#172033 !important; border-color:#cbd5e1 !important; }
      body.mos-regional-light #workspace-viewport input::placeholder,
      body.mos-regional-light #workspace-viewport textarea::placeholder { color:#64748b !important; }
      body.mos-regional-light #workspace-viewport button { color:#172033; }
      body.mos-regional-light #workspace-viewport button[class*="bg-"] { border-color:#cbd5e1; }
      body.mos-regional-light #workspace-viewport a { color:#075985; }
      body.mos-regional-light #workspace-viewport .mos-regional-visual-image { opacity:1 !important; }`
  );

  source = source.replace(
`      .mos-regional-title-block { position:relative !important; padding-right:190px !important; min-height:150px !important; }
      #mos-regional-workspace-visual {
        position:absolute !important; right:0 !important; top:50% !important; transform:translateY(-50%) !important;
        width:150px !important; height:150px !important; margin:0 !important; padding:8px !important;`,
`      .mos-regional-title-block { position:relative !important; padding-right:240px !important; min-height:180px !important; }
      #mos-regional-workspace-visual {
        position:absolute !important; right:0 !important; top:50% !important; transform:translateY(-50%) !important;
        width:210px !important; height:210px !important; margin:0 !important; padding:9px !important;`
  );

  source = source.replace(
`      @media (max-width:900px) {
        .mos-regional-title-block { padding-right:145px !important; min-height:120px !important; }
        #mos-regional-workspace-visual { width:120px !important; height:120px !important; border-radius:16px !important; padding:7px !important; }
      }`,
`      @media (max-width:1000px) and (min-width:641px) {
        .mos-regional-title-block { padding-right:200px !important; min-height:160px !important; }
        #mos-regional-workspace-visual { width:175px !important; height:175px !important; border-radius:19px !important; padding:8px !important; }
      }`
  );

  source = source.replace(
`      @media (max-width:640px) {
        .mos-regional-title-block { padding-right:0 !important; min-height:0 !important; padding-bottom:108px !important; }
        #mos-regional-workspace-visual { width:96px !important; height:96px !important; right:50% !important; top:auto !important; bottom:0 !important; transform:translateX(50%) !important; border-radius:14px !important; padding:6px !important; }
      }`,
`      @media (max-width:640px) {
        .mos-regional-title-block { padding-right:0 !important; min-height:0 !important; padding-bottom:145px !important; }
        #mos-regional-workspace-visual { width:128px !important; height:128px !important; right:50% !important; top:auto !important; bottom:0 !important; transform:translateX(50%) !important; border-radius:17px !important; padding:6px !important; }
      }`
  );

  fs.writeFileSync(file, source, 'utf8');
}

// Keep the standalone public stylesheet consistent with the injected runtime CSS.
const cssFile = path.join(root, 'public', 'regional-visual-fix.css');
if (fs.existsSync(cssFile)) {
  let css = fs.readFileSync(cssFile, 'utf8');
  css = css.replace(/width: 200px !important;\n  height: 200px !important;/, 'width: 210px !important;\n  height: 210px !important;');
  css = css.replace(/width: 150px !important;\n    height: 150px !important;/, 'width: 175px !important;\n    height: 175px !important;');
  css = css.replace(/width: 120px !important;\n    height: 120px !important;/, 'width: 128px !important;\n    height: 128px !important;');
  css = css.replace(/width: 105px !important;\n    height: 105px !important;/, 'width: 112px !important;\n    height: 112px !important;');
  css += `\n/* MOS_REGIONAL_THEME_V2: bright theme is strictly scoped to AP/TG routes. */\nbody.mos-regional-light #workspace-viewport { background:#f5f7fb !important; color:#172033 !important; }\nbody.mos-regional-light #workspace-viewport [class*="dark:bg-"] { background-color:#ffffff !important; }\nbody.mos-regional-light #workspace-viewport [class*="dark:text-white"],\nbody.mos-regional-light #workspace-viewport [class*="dark:text-slate-50"],\nbody.mos-regional-light #workspace-viewport [class*="dark:text-slate-100"],\nbody.mos-regional-light #workspace-viewport [class*="dark:text-slate-200"],\nbody.mos-regional-light #workspace-viewport [class*="dark:text-slate-300"] { color:#172033 !important; }\nbody.mos-regional-light #workspace-viewport [class*="dark:text-slate-400"],\nbody.mos-regional-light #workspace-viewport [class*="dark:text-slate-500"] { color:#526071 !important; }\nbody.mos-regional-light #workspace-viewport [class*="dark:border-"] { border-color:#d7dee8 !important; }\nbody.mos-regional-light #workspace-viewport input,\nbody.mos-regional-light #workspace-viewport select,\nbody.mos-regional-light #workspace-viewport textarea { background:#fff !important; color:#172033 !important; border-color:#cbd5e1 !important; }\n`;
  fs.writeFileSync(cssFile, css, 'utf8');
}
