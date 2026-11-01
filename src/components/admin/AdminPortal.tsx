import React, { Suspense, lazy, useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "../../context/AdminAuthContext";
import { AdminRouteGuard } from "./AdminRouteGuard";

const AdminLogin = lazy(() => import("../../pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("../../pages/admin/AdminDashboard"));

function AdminLoading() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f4f6fa] text-sm font-semibold text-slate-500"><span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#b68b35]" />Loading private admin workspace…</main>;
}

function AdminRouter() {
  const { isAdmin, loading } = useAdminAuth();
  const path = window.location.pathname.replace(/\/+$/, "") || "/theone";
  const isLoginPath = path === "/theone";
  const isDashboardPath = path === "/theone/dashboard";
  const isUnknownAdminPath = path.startsWith("/theone/") && !isDashboardPath;

  useEffect(() => {
    if (isUnknownAdminPath) window.location.replace("/");
    if (!loading && isLoginPath && isAdmin) window.location.replace("/theone/dashboard");
  }, [isUnknownAdminPath, isLoginPath, isAdmin, loading]);

  if (isUnknownAdminPath) return <AdminLoading />;
  if (isDashboardPath) {
    return <AdminRouteGuard><Suspense fallback={<AdminLoading />}><AdminDashboard /></Suspense></AdminRouteGuard>;
  }
  return <Suspense fallback={<AdminLoading />}><AdminLogin /></Suspense>;
}

export default function AdminPortal() {
  return <AdminAuthProvider><AdminRouter /></AdminAuthProvider>;
}
