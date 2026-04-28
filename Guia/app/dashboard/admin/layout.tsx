"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Tag, Users, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const routes = [
    { name: "Visão Geral", path: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Planos de Assinatura", path: "/dashboard/admin/planos", icon: Package },
    { name: "Cupons", path: "/dashboard/admin/cupons", icon: Tag },
    { name: "Assinaturas", path: "/dashboard/admin/assinaturas", icon: Users },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      <div className="w-full md:w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Painel Admin</h2>
        </div>
        <nav className="p-4 space-y-2">
          {routes.map((route) => {
            const isActive = pathname === route.path;
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                href={route.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                <span>{route.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
