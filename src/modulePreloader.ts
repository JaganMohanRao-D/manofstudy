import { preload, findLoaderKey } from './modulePreloaderCore';

export const MODULE_PRELOAD_KEYS = [
  'AP EAPCET College Predictor',
  'TG EAPCET College Predictor',
  'AP EAPCET Top B.Tech Colleges',
  'Top B.Tech Colleges in Telangana',
  'AP Allotments (Namewise)',
  'TG EAPCET 2026 Final Phase Seat Allotments Name Wise',
] as const;

if (typeof window !== 'undefined') {
  const startPreload = (event: Event) => preload(findLoaderKey(event.target as Element | null) || '');
  document.addEventListener('pointerdown', startPreload, { capture: true, passive: true });
  document.addEventListener('touchstart', startPreload, { capture: true, passive: true });

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const canWarm = !connection?.saveData && connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g';
  if (canWarm) {
    const warm = () => MODULE_PRELOAD_KEYS.forEach(preload);
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(warm, { timeout: 3500 });
    } else {
      globalThis.setTimeout(warm, 1800);
    }
  }

  const updateLoadingText = (root: ParentNode) => {
    root.querySelectorAll('span').forEach((span) => {
      if (span.textContent?.trim() === 'Loading module...') span.textContent = "Hold on student, it's loading";
    });
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      updateLoadingText(element.matches('span') ? element.parentNode || element : element);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  updateLoadingText(document);
}
