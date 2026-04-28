"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "@/app/actions.auth";
import { useToast } from "@/components/ToastProvider";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const session = await getUserSession();
        if (!session || session.role !== "admin") {
          showToast("⚠️ Acesso restrito apenas ao administrador.");
          router.replace("/login");
          return;
        }
        setAuthorized(true);
      } catch (error) {
        console.error("Admin auth check failed:", error);
        router.replace("/login");
      }
    };

    checkAdmin();
  }, [router, showToast]);

  if (!authorized) {
    return (
      <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-slate-500 font-medium">Verificando credenciais...</p>
      </div>
    );
  }

  return <>{children}</>;
}
