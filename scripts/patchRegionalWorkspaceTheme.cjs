const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'src', 'components', 'SiteUxFixes.tsx');
let source = fs.readFileSync(file, 'utf8');

// Regional workspaces are identified by their explicit route family only.
// Never infer AP/TG from page text because unrelated tools can mention those terms.
source = source.replace(
`  const viewportText = document.getElementById('workspace-viewport')?.textContent?.toLowerCase() || '';
  if (viewportText.includes('tg eapcet') || viewportText.includes('telangana')) return 'tg';
  if (viewportText.includes('ap eapcet') || viewportText.includes('andhra pradesh')) return 'ap';
  return null;`,
`  return null;`
);

// One source of truth for regional theme state.
if (!source.includes('MOS_REGIONAL_THEME_V3')) {
  const marker = `const SiteUxFixes: React.FC = () => {`;
  const helpers = `/* MOS_REGIONAL_THEME_V3 */
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
}

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

// Replace the previous narrow contrast patch with a complete, scoped light system.
const oldThemeStart = `      html.light { color-scheme: dark !important; }`;
const oldThemeEnd = `      [title^="Switch to "] { display:none !important; }`;
const start = source.indexOf(oldThemeStart);
const end = source.indexOf(oldThemeEnd);
if (start !== -1 && end !== -1) {
  const replacement = `      html.light { color-scheme: light !important; }
      html.light body { background:#f5f7fb !important; color:#172033 !important; }
      [title^="Switch to "] { display:none !important; }

      /* MOS_REGIONAL_THEME_V3: AP/TG only. All selectors are scoped to the regional workspace. */
      body.mos-regional-light { background:#f5f7fb !important; color:#172033 !important; }
      body.mos-regional-light #workspace-viewport {
        background:#f5f7fb !important;
        color:#172033 !important;
      }
      body.mos-regional-light #workspace-viewport header,
      body.mos-regional-light #workspace-viewport section,
      body.mos-regional-light #workspace-viewport article,
      body.mos-regional-light #workspace-viewport form,
      body.mos-regional-light #workspace-viewport [role="region"] {
        color:#172033;
      }
      body.mos-regional-light #workspace-viewport [class*="bg-slate-950"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-900"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-800"],
      body.mos-regional-light #workspace-viewport [class*="bg-slate-700"],
      body.mos-regional-light #workspace-viewport [class*="bg-gray-950"],
      body.mos-regional-light #workspace-viewport [class*="bg-gray-900"],
      body.mos-regional-light #workspace-viewport [class*="bg-gray-800"],
      body.mos-regional-light #workspace-viewport [class*="bg-black"] {
        background:#ffffff !important;
      }
      body.mos-regional-light #workspace-viewport [class*="bg-white"] { background:#ffffff !important; }
      body.mos-regional-light #workspace-viewport [class*="text-white"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-50"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-100"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-200"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-300"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-50"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-100"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-200"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-300"] {
        color:#172033 !important;
      }
      body.mos-regional-light #workspace-viewport [class*="text-slate-400"],
      body.mos-regional-light #workspace-viewport [class*="text-slate-500"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-400"],
      body.mos-regional-light #workspace-viewport [class*="text-gray-500"] {
        color:#526071 !important;
      }
      body.mos-regional-light #workspace-viewport [class*="border-slate-"],
      body.mos-regional-light #workspace-viewport [class*="border-gray-"],
      body.mos-regional-light #workspace-viewport [class*="border-white"] {
        border-color:#d7dee8 !important;
      }
      body.mos-regional-light #workspace-viewport input,
      body.mos-regional-light #workspace-viewport select,
      body.mos-regional-light #workspace-viewport textarea {
        background:#ffffff !important;
        color:#172033 !important;
        border-color:#cbd5e1 !important;
        caret-color:#172033 !important;
      }
      body.mos-regional-light #workspace-viewport input::placeholder,
      body.mos-regional-light #workspace-viewport textarea::placeholder {
        color:#64748b !important;
        opacity:1 !important;
      }
      body.mos-regional-light #workspace-viewport select option {
        background:#ffffff !important;
        color:#172033 !important;
      }
      body.mos-regional-light #workspace-viewport input:focus,
      body.mos-regional-light #workspace-viewport select:focus,
      body.mos-regional-light #workspace-viewport textarea:focus {
        outline:2px solid rgba(14,116,144,.22) !important;
        outline-offset:1px !important;
        border-color:#0e7490 !important;
      }
      body.mos-regional-light #workspace-viewport button { color:#172033; }
      body.mos-regional-light #workspace-viewport a { color:#075985; }
      body.mos-regional-light #workspace-viewport [aria-selected="false"] { color:#334155 !important; }
      body.mos-regional-light #workspace-viewport [aria-selected="true"] { color:#0f172a !important; }
      body.mos-regional-light #workspace-viewport table { color:#172033 !important; }
      body.mos-regional-light #workspace-viewport th,
      body.mos-regional-light #workspace-viewport td { border-color:#e2e8f0 !important; }
      body.mos-regional-light #workspace-viewport ::selection { background:#bae6fd !important; color:#0f172a !important; }

`;
  source = source.slice(0, start) + replacement + source.slice(end + oldThemeEnd.length);
}

// Make the existing regional artwork blend into the light hero without altering the asset.
source = source.replace(
`      /* AP/TG landmark: compact square card beside the workspace title, never a full-width banner. */
      .mos-regional-title-block { position:relative !important; padding-right:190px !important; min-height:150px !important; }
      #mos-regional-workspace-visual {
        position:absolute !important; right:0 !important; top:50% !important; transform:translateY(-50%) !important;
        width:150px !important; height:150px !important; margin:0 !important; padding:8px !important;
        box-sizing:border-box !important; border:1px solid rgba(34,211,238,.24) !important;
        border-radius:18px !important; background:rgba(7,16,29,.82) !important;
        overflow:hidden !important; box-shadow:0 12px 32px rgba(2,6,23,.24) !important;
      }
      .mos-regional-visual-frame { width:100% !important; height:100% !important; overflow:hidden !important; border-radius:12px !important; display:flex !important; align-items:center !important; justify-content:center !important; background:#07101d !important; }
      .mos-regional-visual-image { display:block !important; width:100% !important; height:100% !important; max-width:none !important; max-height:none !important; object-fit:contain !important; object-position:center !important; opacity:.96 !important; }`,
`      /* AP/TG landmark: existing artwork beside the title, with no dark letterbox/frame. */
      .mos-regional-title-block { position:relative !important; padding-right:250px !important; min-height:184px !important; }
      #mos-regional-workspace-visual {
        position:absolute !important; right:0 !important; top:50% !important; transform:translateY(-50%) !important;
        width:228px !important; max-width:30vw !important; height:auto !important; margin:0 !important; padding:0 !important;
        box-sizing:border-box !important; border:0 !important; border-radius:12px !important;
        background:#ffffff !important; overflow:visible !important;
        box-shadow:0 8px 24px rgba(15,23,42,.08) !important;
      }
      .mos-regional-visual-frame { width:100% !important; height:auto !important; overflow:visible !important; border-radius:12px !important; display:block !important; background:#ffffff !important; }
      .mos-regional-visual-image { display:block !important; width:100% !important; height:auto !important; max-width:100% !important; max-height:none !important; object-fit:contain !important; object-position:center !important; opacity:1 !important; border-radius:12px !important; }`
);

source = source.replace(
`      @media (max-width:900px) {
        .mos-regional-title-block { padding-right:145px !important; min-height:120px !important; }
        #mos-regional-workspace-visual { width:120px !important; height:120px !important; border-radius:16px !important; padding:7px !important; }
      }`,
`      @media (max-width:1000px) and (min-width:641px) {
        .mos-regional-title-block { padding-right:195px !important; min-height:165px !important; }
        #mos-regional-workspace-visual { width:175px !important; max-width:32vw !important; border-radius:10px !important; }
      }`
);

source = source.replace(
`      @media (max-width:640px) {
        .mos-regional-title-block { padding-right:0 !important; min-height:0 !important; padding-bottom:108px !important; }
        #mos-regional-workspace-visual { width:96px !important; height:96px !important; right:50% !important; top:auto !important; bottom:0 !important; transform:translateX(50%) !important; border-radius:14px !important; padding:6px !important; }
      }`,
`      @media (max-width:640px) {
        .mos-regional-title-block { padding-right:0 !important; min-height:0 !important; padding-bottom:132px !important; }
        #mos-regional-workspace-visual { width:132px !important; max-width:52vw !important; height:auto !important; right:50% !important; top:auto !important; bottom:0 !important; transform:translateX(50%) !important; border-radius:10px !important; }
      }`
);

// Keep the theme synced if the existing app changes routes/rendered workspace in-place.
if (!source.includes('syncRegionalTheme();\n      addRegionalWorkspaceVisual();')) {
  source = source.replace(
`    const observer = new MutationObserver(() => {
      hideMockTestCards();
      addMockTestShortcut();
      addRegionalWorkspaceVisual();
    });`,
`    const observer = new MutationObserver(() => {
      syncRegionalTheme();
      hideMockTestCards();
      addMockTestShortcut();
      addRegionalWorkspaceVisual();
    });`
  );
}

fs.writeFileSync(file, source, 'utf8');

// Keep the standalone stylesheet consistent with the runtime-injected regional UI.
const cssFile = path.join(root, 'public', 'regional-visual-fix.css');
if (fs.existsSync(cssFile)) {
  const css = `/* Naa College — AP/TG regional workspace visual and light theme. */
#workspace-viewport { position: relative !important; }

body.mos-regional-light #workspace-viewport { background:#f5f7fb !important; color:#172033 !important; }
body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) header { position:relative !important; overflow:visible !important; }
body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block {
  position:relative !important;
  min-height:184px !important;
  padding-right:250px !important;
  padding-top:42px !important;
  box-sizing:border-box !important;
}
body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) header button[title="Return to Naa College Feature Hub"] {
  position:absolute !important;
  top:20px !important;
  left:24px !important;
  z-index:6 !important;
  margin:0 !important;
  white-space:nowrap !important;
}
body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual {
  position:absolute !important;
  z-index:5 !important;
  top:50% !important;
  right:0 !important;
  transform:translateY(-50%) !important;
  width:228px !important;
  max-width:30vw !important;
  height:auto !important;
  margin:0 !important;
  padding:0 !important;
  box-sizing:border-box !important;
  border:0 !important;
  border-radius:12px !important;
  background:#ffffff !important;
  overflow:visible !important;
  box-shadow:0 8px 24px rgba(15,23,42,.08) !important;
  pointer-events:none !important;
}
body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-visual-frame {
  width:100% !important;
  height:auto !important;
  min-height:0 !important;
  overflow:visible !important;
  display:block !important;
  border-radius:12px !important;
  background:#ffffff !important;
}
body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-visual-image {
  display:block !important;
  width:100% !important;
  height:auto !important;
  max-width:100% !important;
  max-height:none !important;
  object-fit:contain !important;
  object-position:center !important;
  opacity:1 !important;
  border-radius:12px !important;
}

@media (max-width:1000px) and (min-width:641px) {
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block {
    min-height:165px !important;
    padding-right:195px !important;
    padding-top:40px !important;
  }
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual {
    width:175px !important;
    max-width:32vw !important;
  }
}

@media (max-width:640px) {
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block {
    min-height:0 !important;
    padding-right:0 !important;
    padding-top:42px !important;
    padding-bottom:132px !important;
  }
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) header button[title="Return to Naa College Feature Hub"] {
    top:14px !important;
    left:16px !important;
    max-width:calc(100% - 32px) !important;
    padding:8px 11px !important;
    font-size:11px !important;
  }
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual {
    top:auto !important;
    bottom:0 !important;
    right:50% !important;
    transform:translateX(50%) !important;
    width:132px !important;
    max-width:52vw !important;
  }
}

@media (max-width:390px) {
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) .mos-regional-title-block { padding-bottom:118px !important; }
  body.mos-regional-light #workspace-viewport:has(#mos-regional-workspace-visual) #mos-regional-workspace-visual { width:116px !important; }
}
`;
  fs.writeFileSync(cssFile, css, 'utf8');
}
