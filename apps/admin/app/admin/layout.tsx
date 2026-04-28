"use client";

import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </AdminProtectedRoute>
  );
}
