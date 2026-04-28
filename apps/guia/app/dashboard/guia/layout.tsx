"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutUser, getUserSession } from "@/app/actions.auth";
import { getUnreadNotificationsCount } from "@/app/actions.notifications";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { GuideBottomNav } from "@/components/GuideBottomNav";

const navItems = [
  { href: "/dashboard/guia", label: "Dashboard", icon: "fas fa-th-large" },
  { href: "/dashboard/guia/clientes", label: "Clientes", icon: "fas fa-users" },
  { href: "/dashboard/guia/pacotes", label: "Pacotes", icon: "fas fa-box" },
  { href: "/dashboard/guia/roteiros", label: "Roteiros", icon: "fas fa-route" },
  { href: "/dashboard/guia/reservas", label: "Agenda", icon: "fas fa-calendar-alt" },
];

const systemItems = [
  { href: "/dashboard/guia/planos", label: "Assinatura", icon: "fas fa-crown" },
  { href: "/dashboard/guia/notificacoes", label: "Notificações", icon: "fas fa-bell" },
  { href: "/dashboard/guia/plugins", label: "Plugins & Módulos", icon: "fas fa-puzzle-piece" },
  { href: "/dashboard/guia/perfil", label: "Perfil", icon: "fas fa-user-cog" },
]

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      const u = await getUserSession();
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        const count = await getUnreadNotificationsCount(u.id);
        setUnreadCount(count);
        setIsReady(true);
      }
    }
    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    showToast("🚪 Saindo...");
    await logoutUser();
    router.push("/login");
  };

  if (!isReady) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Overlay mobile */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside 
        className={`
          w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-50 fixed md:static
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shadow-md">
              <i className="fas fa-map-location-dot text-white"></i>
            </div>
            <div>
              <h2 className="font-bold text-lg">Guia Local</h2>
              <p className="text-[10px] text-slate-500">Holambra · Cidade das Flores 🌷</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Principal</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${isActive ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <i className={`${item.icon} w-5`}></i> {item.label}
              </Link>
            );
          })}
          
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-4 mb-2">Sistema</div>
          {systemItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${isActive ? 'bg-orange-50 text-orange-500 border-l-4 border-orange-500 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <i className={`${item.icon} w-5`}></i> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold uppercase overflow-hidden">
               {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors p-2 shrink-0">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-600 p-2">
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-xl font-bold hidden md:block">
              {navItems.find(i => i.href === pathname)?.label || systemItems.find(i => i.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/guia/notificacoes" className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center transition hover:bg-slate-200">
              <i className="far fa-bell text-slate-600"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
            <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center md:hidden transition hover:bg-slate-200" onClick={() => showToast('⚙️ Configurações')}>
              <i className="fas fa-cog text-slate-600"></i>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:pb-6 pb-24">
          {children}
        </div>
        <GuideBottomNav />
      </main>
    </div>
  );
}
