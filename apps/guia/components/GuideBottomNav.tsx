"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Map, Route, UserCircle } from "lucide-react";

export function GuideBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-2 flex justify-between items-center z-40">
      <NavItem href="/dashboard/guia" icon={<LayoutDashboard size={22} />} label="Painel" active={pathname === "/dashboard/guia"} />
      <NavItem href="/dashboard/guia/pacotes" icon={<Package size={22} />} label="Pacotes" active={pathname?.startsWith("/dashboard/guia/pacotes")} />
      
      <div className="relative -mt-6">
        <Link
          href="/dashboard/guia/prospector"
          className="h-14 w-14 bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-900 transition-transform active:scale-95"
        >
          <Map size={24} />
        </Link>
      </div>

      <NavItem href="/dashboard/guia/roteiros" icon={<Route size={22} />} label="Roteiros" active={pathname?.startsWith("/dashboard/guia/roteiros")} />
      <NavItem href="/dashboard/guia/perfil" icon={<UserCircle size={22} />} label="Perfil" active={pathname?.startsWith("/dashboard/guia/perfil")} />
    </nav>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean | undefined }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center transition-colors min-w-[60px] ${active ? "text-orange-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </Link>
  );
}
