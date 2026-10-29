import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Account control for the Mock Test Series hub.
 * The hub is route-mounted, so this component watches for it to appear before
 * creating the portal mount point. It reuses the existing Firebase auth flow.
 */
export const MockTestAccountControl: React.FC = () => {
  const { user, loading, openAuthModal, signOut } = useAuth();
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let cancelled = false;
    let currentNode: HTMLElement | null = null;

    const attach = () => {
      if (cancelled || currentNode) return;

      const hub = document.getElementById('mock-test-series');
      if (!hub) return;

      // When signed in, place the action directly beside the existing profile row.
      if (user) {
        const signedInLabel = Array.from(hub.querySelectorAll('div')).find(
          (node) => node.textContent?.trim() === 'Signed in',
        );
        const existingRow = signedInLabel?.parentElement;
        if (!existingRow) return;

        const node = document.createElement('span');
        node.className = 'mos-mock-account-action-slot inline-flex shrink-0';
        node.dataset.mosMockAccountAction = 'true';
        existingRow.appendChild(node);
        currentNode = node;
        setMountNode(node);
        return;
      }

      // When signed out, place the Google sign-in action under the hub heading.
      const heading = hub.querySelector('h2');
      if (!heading) return;

      const node = document.createElement('span');
      node.className = 'mos-mock-account-action-slot block mt-2';
      node.dataset.mosMockAccountAction = 'true';
      heading.insertAdjacentElement('afterend', node);
      currentNode = node;
      setMountNode(node);
    };

    attach();

    // The Mock Test hub is mounted/unmounted during workspace navigation. A
    // MutationObserver makes the control attach reliably even when the hub is
    // rendered after this global component.
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer.disconnect();
      currentNode?.remove();
      currentNode = null;
      setMountNode(null);
    };
  }, [user]);

  if (!mountNode || loading) return null;

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return createPortal(
    user ? (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        title="Sign out of your Google account"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-950/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-700 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
        <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => openAuthModal({ type: 'mock-test' })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign in with Google</span>
      </button>
    ),
    mountNode,
  );
};

export default MockTestAccountControl;
