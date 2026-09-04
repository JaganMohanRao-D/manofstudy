/**
 * Adsterra Social Bar Session & 24-Hour Suppression Manager
 * Prevents intrusive ad loops by detecting native "Hide" or "Close" button clicks,
 * storing session-persistent and 24-hour suppression flags, and eliminating residual DOM nodes.
 */

const ADSTERRA_SUPPRESSED_KEY = 'adsterra_suppressed';
const ADSTERRA_SUPPRESSED_UNTIL_KEY = 'adsterra_suppressed_until';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24-hour suppression alternative

/**
 * Checks whether the Adsterra Social Bar is currently suppressed for this session or 24-hour window.
 */
export function isAdsterraSuppressed(): boolean {
  try {
    const sessionSuppressed = sessionStorage.getItem(ADSTERRA_SUPPRESSED_KEY) === 'true';
    const until = localStorage.getItem(ADSTERRA_SUPPRESSED_UNTIL_KEY);
    const timeSuppressed = until ? Date.now() < parseInt(until, 10) : false;

    if (timeSuppressed && !sessionSuppressed) {
      sessionStorage.setItem(ADSTERRA_SUPPRESSED_KEY, 'true');
    }

    return sessionSuppressed || timeSuppressed;
  } catch {
    return false;
  }
}

/**
 * Clean up all Adsterra DOM elements (script tag, floating banners, social bar widgets, and iframes)
 */
export function cleanupAdsterraDom(): void {
  try {
    // 1. Remove Social Bar script tag
    const script = document.getElementById('adsterra-socialbar-script') ||
      document.querySelector('script[src*="cade5b3d4fc24fa9fe12cc7a5e3888ca.js"]');
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }

    // 2. Remove all iframes from profitableratecpmnetwork
    const adIframes = document.querySelectorAll('iframe');
    adIframes.forEach((iframe) => {
      try {
        if (iframe.src && iframe.src.includes('profitableratecpmnetwork')) {
          const container = iframe.closest('div') || iframe;
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }
      } catch {
        // Ignore cross-origin access errors
      }
    });

    // 3. Remove floating elements outside of the root container that have adsterra or socialbar signatures
    const bodyChildren = document.body.children;
    const toRemove: Element[] = [];

    for (let i = 0; i < bodyChildren.length; i++) {
      const el = bodyChildren[i];
      if (el.id === 'root') continue;

      const html = el.outerHTML || '';
      const isAdsterra =
        html.includes('profitableratecpmnetwork') ||
        html.includes('adsterra') ||
        html.includes('socialbar') ||
        el.className.toString().includes('socialbar') ||
        el.id.includes('socialbar');

      // Check for fixed floating widgets with very high z-index typical of Adsterra Social Bar
      const style = window.getComputedStyle(el);
      const isFloatingHighZ =
        (style.position === 'fixed' || style.position === 'absolute') &&
        parseInt(style.zIndex, 10) > 9000 &&
        !el.id.includes('modal') &&
        !el.id.includes('palette') &&
        !el.id.includes('dimmer');

      if (isAdsterra || isFloatingHighZ) {
        toRemove.push(el);
      }
    }

    toRemove.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  } catch (err) {
    console.warn('Adsterra DOM cleanup encountered notice:', err);
  }
}

/**
 * Suppress the Adsterra Social Bar for the remaining duration of the session
 * and for 24 hours in localStorage.
 */
export function suppressAdsterra(): void {
  try {
    sessionStorage.setItem(ADSTERRA_SUPPRESSED_KEY, 'true');
    localStorage.setItem(ADSTERRA_SUPPRESSED_UNTIL_KEY, String(Date.now() + ONE_DAY_MS));

    cleanupAdsterraDom();

    // Dispatch a custom event so any active component can update
    window.dispatchEvent(new CustomEvent('adsterra:suppressed'));
  } catch (err) {
    console.warn('Failed to set suppression flags:', err);
  }
}

/**
 * Initialize event detection for native "Hide" or "Close" button clicks across the DOM.
 */
export function initAdsterraSuppressionListener(): () => void {
  // If already suppressed, clean up immediately and return
  if (isAdsterraSuppressed()) {
    cleanupAdsterraDom();
    return () => {};
  }

  // Detect clicks on Adsterra close/hide buttons using capturing phase
  const handleInteraction = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked element or parent is a close/hide/dismiss control
    const closeElement = target.closest(
      '[class*="close" i], [class*="dismiss" i], [class*="hide" i], [id*="close" i], [aria-label*="close" i], [title*="close" i], [data-action*="close" i]'
    );

    // Also check for SVG / text containing close symbols (✕, ×, X)
    const text = (target.textContent || '').trim();
    const isCloseSymbol = text === '×' || text === '✕' || text === 'X';

    if (closeElement || isCloseSymbol) {
      // Confirm if the click is within an ad container or fixed overlay outside #root
      const isInsideAd =
        target.closest('[id*="adsterra" i], [class*="adsterra" i], [class*="socialbar" i], [id*="socialbar" i]') ||
        target.closest('iframe[src*="profitableratecpmnetwork"]') ||
        (target.closest('div') && target.closest('div') !== document.getElementById('root') && !target.closest('#root'));

      if (isInsideAd) {
        suppressAdsterra();
      }
    }
  };

  // Listen for iframe postMessages that might signal dismissal
  const handleMessage = (e: MessageEvent) => {
    try {
      if (typeof e.data === 'string') {
        if (/close|dismiss|hide|cancel/i.test(e.data) && /adsterra|profitableratecpmnetwork|socialbar/i.test(e.data)) {
          suppressAdsterra();
        }
      } else if (e.data && typeof e.data === 'object') {
        const str = JSON.stringify(e.data);
        if (/close|dismiss|hide/i.test(str) && /ad|banner|bar/i.test(str)) {
          suppressAdsterra();
        }
      }
    } catch {
      // Ignore
    }
  };

  // MutationObserver to attach listeners to newly injected ad widgets
  const observer = new MutationObserver((mutations) => {
    if (isAdsterraSuppressed()) {
      cleanupAdsterraDom();
      return;
    }

    for (const mutation of mutations) {
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const node = mutation.addedNodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.id === 'root') continue;

          const html = el.outerHTML || '';
          if (html.includes('profitableratecpmnetwork') || html.includes('socialbar')) {
            // Attach direct click & touch listeners to any close button inside
            const closeBtns = el.querySelectorAll(
              '[class*="close"], [class*="dismiss"], [class*="hide"], [id*="close"], [aria-label*="close" i], button, a'
            );
            closeBtns.forEach((btn) => {
              btn.addEventListener('click', () => suppressAdsterra(), { once: true });
              btn.addEventListener('touchend', () => suppressAdsterra(), { once: true });
            });
          }
        }
      }
    }
  });

  document.addEventListener('click', handleInteraction, true);
  document.addEventListener('touchend', handleInteraction, true);
  window.addEventListener('message', handleMessage);

  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch {
    // Fallback if body not ready
  }

  return () => {
    document.removeEventListener('click', handleInteraction, true);
    document.removeEventListener('touchend', handleInteraction, true);
    window.removeEventListener('message', handleMessage);
    observer.disconnect();
  };
}
