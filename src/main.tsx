import React, { lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './modulePreloader.ts';
import './scholarshipUx.css';

// Separate lazy entry points prevent owner-only Firebase code from loading for
// public visitors, and keep a visible fallback while either route is loading.
const PublicAppShell = lazy(() => import('./PublicAppShell.tsx'));
const AdminPortal = lazy(() => import('./components/admin/AdminPortal.tsx'));

function StartupFallback() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f9ff] px-6 text-center text-slate-700"
    >
      <img
        src="/Naa%20College%20logo.webp"
        alt="Naa College"
        width={184}
        height={80}
        className="h-auto w-[min(184px,54vw)] object-contain"
      />
      <span
        aria-hidden="true"
        className="h-7 w-7 animate-spin rounded-full border-[3px] border-emerald-700/20 border-t-emerald-700"
      />
      <p className="text-sm font-semibold">Preparing your student tools…</p>
    </main>
  );
}

type RootErrorBoundaryState = { hasError: boolean };

class RootErrorBoundary extends React.Component<
  React.PropsWithChildren,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Naa College startup] The application failed to render.', error, errorInfo);
    // Ensure the HTML loading cover cannot conceal this recovery screen.
    document.documentElement.classList.add('app-ready');
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f9ff] px-6 py-12 text-center text-slate-800"
        >
          <img
            src="/Naa%20College%20logo.webp"
            alt="Naa College"
            width={184}
            height={80}
            className="mb-2 h-auto w-[min(184px,54vw)] object-contain"
          />
          <h1 className="text-2xl font-extrabold tracking-tight">Naa College couldn’t start</h1>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Something interrupted the page while it was loading. Your browser can try loading it again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Reload Naa College
          </button>
          <a href="/" className="text-sm font-semibold text-emerald-800 underline underline-offset-4">
            Go to the homepage
          </a>
        </main>
      );
    }

    return this.props.children;
  }
}

function AppBootstrap() {
  useEffect(() => {
    // React has committed either the public/admin route or the visible
    // Suspense fallback. The static HTML cover can now safely step away.
    document.documentElement.classList.add('app-ready');
  }, []);

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  return (
    <Suspense fallback={<StartupFallback />}>
      {pathname === '/theone' ? <AdminPortal /> : <PublicAppShell />}
    </Suspense>
  );
}

const mountNode = document.getElementById('root');
if (!mountNode) {
  throw new Error('Naa College app root was not found.');
}

createRoot(mountNode).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AppBootstrap />
    </RootErrorBoundary>
  </React.StrictMode>,
);
