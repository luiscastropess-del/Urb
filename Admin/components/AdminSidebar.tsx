"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Menu, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MapPin, 
  Map, 
  FileText, 
  CreditCard, 
  Box, 
  Wrench, 
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  UserCheck,
  History,
  TrendingUp,
  Database,
  Globe,
  Tag,
  Search,
  Key,
  LogOut,
  Package,
  Ticket,
  BadgeCheck
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { logoutUser } from "@/app/actions.auth";
import { useToast } from "@/components/ToastProvider";

interface MenuItem {
  title: string;
  icon: any;
  path?: string;
  submenus?: { title: string; path: string; icon: any }[];
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [activePlugins, setActivePlugins] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/admin/plugins").then(r => r.json()).then(data => {
      if(data.success) {
        setActivePlugins(data.plugins);
      }
    });
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleSubmenu = (title: string) => {
    if (expandedMenus.includes(title)) {
      setExpandedMenus(expandedMenus.filter(m => m !== title));
    } else {
      setExpandedMenus([...expandedMenus, title]);
    }
  };

  const menuItems: MenuItem[] = [
    { 
      title: "Dashboard", 
      icon: LayoutDashboard, 
      path: "/admin" 
    },
    { 
      title: "Usuários", 
      icon: Users,
      submenus: [
        { title: "Lista de Usuários", path: "/admin/users", icon: List },
        { title: "Administradores", path: "/admin/users/admins", icon: UserCheck },
        { title: "Atividades", path: "/admin/users/activity", icon: History }
      ]
    },
    { 
      title: "Clientes", 
      icon: Briefcase,
      submenus: [
        { title: "Lista de Clientes", path: "/admin/clients", icon: List },
        { title: "Transações", path: "/admin/clients/transactions", icon: TrendingUp }
      ]
    },
    { 
      title: "Locais", 
      icon: MapPin,
      submenus: [
        { title: "Todos os Locais", path: "/admin", icon: List },
        { title: "Prospecções", path: "/admin/prospects", icon: Database },
        { title: "Adicionar Novo", path: "/admin/add", icon: Plus },
        { title: "Categorias", path: "/admin/categories", icon: Tag },
        { title: "Importar Google", path: "/admin/import", icon: Database }
      ]
    },
    { 
      title: "Cidades", 
      icon: Map,
      submenus: [
        { title: "Gerenciar Cidades", path: "/admin/cities", icon: Globe }
      ]
    },
    {
      title: "Guias & Roteiros",
      icon: Briefcase, // Note: importing Briefcase (already imported)
      submenus: [
        { title: "Lista de Guias", path: "/admin/guias", icon: UserCheck },
        { title: "Reservas", path: "/admin/reservas", icon: CreditCard }
      ]
    },
    { 
      title: "Blog", 
      icon: FileText,
      submenus: [
        { title: "Postagens", path: "/admin/blog", icon: FileText },
        { title: "Categorias Blog", path: "/admin/blog/categories", icon: Tag }
      ]
    },
    { 
      title: "Faturamento e Planos", 
      icon: CreditCard,
      submenus: [
        { title: "Planos de Assinatura", path: "/admin/planos", icon: Package },
        { title: "Cupons", path: "/admin/cupons", icon: Ticket },
        { title: "Assinaturas", path: "/admin/assinaturas", icon: BadgeCheck },
        { title: "Relatórios", path: "/admin/billing/reports", icon: TrendingUp }
      ]
    },
    { 
      title: "Plug-ins", 
      icon: Box,
      submenus: [
        { title: "Instalados", path: "/admin/plugins", icon: Box },
        { title: "Marketplace", path: "/admin/plugins/market", icon: Search },
        // Dynamic plugins mapped here
        ...activePlugins.map(p => ({
          title: p.name,
          path: `/admin/plugins/run/${p.slug}`,
          icon: Box
        }))
      ]
    },
    { 
      title: "Ferramentas", 
      icon: Wrench,
      submenus: [
        { title: "Backups", path: "/admin/tools/backup", icon: Database },
        { title: "Logs", path: "/admin/tools/logs", icon: History }
      ]
    },
    {
      title: "Configurações", 
      icon: Settings,
      submenus: [
        { title: "Geral", path: "/admin/settings/general", icon: Settings },
        { title: "SEO", path: "/admin/settings/seo", icon: Globe },
        { title: "Atualizar Servidor", path: "/admin/settings/server", icon: Database }
      ]
    },
    {
      title: "Integrações & APIs",
      icon: Globe,
      submenus: [
        { title: "Chaves de API", path: "/admin/settings/keys", icon: Key },
        { title: "Links de Rota", path: "/admin/settings/routes", icon: Globe }
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Drawer Toggle */}
      <div className="fixed top-6 left-5 z-[60]">
        <button 
          onClick={toggleMenu}
          className="h-10 w-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform active:scale-95"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl z-[58] flex flex-col pt-20 px-4 pb-6 overflow-y-auto"
      >
        <div className="mb-8 px-2 flex flex-col items-center text-center">
           <div className="w-16 h-16 mb-2 rounded-2xl bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none overflow-hidden relative">
             <div className="absolute inset-0 flex items-center justify-center font-black text-2xl tracking-tighter">CV</div>
             {/* Quando o arquivo public/logo.png existir, descomente a linha abaixo */}
             {/* <Image src="/logo.png" alt="City Ventures Logo" fill className="object-cover" /> */}
           </div>
           <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">City Ventures</h2>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Passeios e Eventos Divertidos!</p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isExpanded = expandedMenus.includes(item.title);
            const hasSubmenus = item.submenus && item.submenus.length > 0;
            const isActive = item.path === pathname || item.submenus?.some(s => s.path === pathname);

            return (
              <div key={item.title} className="mb-1">
                <button
                  onClick={() => hasSubmenus ? toggleSubmenu(item.title) : item.path && handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-bold" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="text-sm">{item.title}</span>
                  </div>
                  {hasSubmenus && (
                    <div className="transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={14} />
                    </div>
                  )}
                </button>

                {hasSubmenus && (
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                    className="overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 rounded-xl mt-1 ml-2 border-l-2 border-slate-100 dark:border-slate-800"
                  >
                    {item.submenus?.map((sub) => (
                      <button
                        key={sub.title}
                        onClick={() => handleNavigate(sub.path)}
                        className={`w-full flex items-center gap-3 p-2.5 px-4 text-xs transition-all ${
                          pathname === sub.path 
                            ? "text-orange-600 dark:text-orange-400 font-bold" 
                            : "text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        <sub.icon size={12} />
                        {sub.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={async () => {
               await logoutUser();
               showToast("👋 Você saiu da sua conta");
               router.replace("/login");
             }}
             className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm"
           >
             <LogOut size={18} />
             Sair da conta
           </button>
        </div>
      </motion.aside>
    </>
  );
}
