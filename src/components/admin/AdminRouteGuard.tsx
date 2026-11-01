import React, { useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) window.location.replace("/");
  }, [loading, isAdmin]);

  if (loading || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-5 text-slate-700">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#b68b35]" />
          <span className="text-sm font-semibold">Verifying administrator access…</span>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
