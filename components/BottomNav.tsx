"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Camera, Calendar, User, Package } from "lucide-react";
import { useToast } from "./ToastProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { showToast } = useToast();

  const handleCameraClick = () => {
    showToast("📸 Camera aberta para check-in!");
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 pb-4 pt-2 flex justify-between items-center z-40">
      <NavItem
        href="/pacotes"
        icon={<Package size={24} />}
        label="Tour"
        active={pathname?.startsWith("/pacotes")}
      />
      <NavItem
        href="/favorites"
        icon={<Heart size={24} />}
        label="Favoritos"
        active={pathname?.startsWith("/favorites")}
      />

      <div className="relative -mt-6">
        <button
          onClick={handleCameraClick}
          className="h-14 w-14 bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-900 transition-transform active:scale-95"
        >
          <Camera size={24} />
        </button>
      </div>

      <NavItem
        href="/explore"
        icon={<Compass size={24} />}
        label="Explorar"
        active={pathname?.startsWith("/explore")}
      />
      <NavItem
        href="/profile"
        icon={<User size={24} />}
        label="Perfil"
        active={pathname?.startsWith("/profile")}
      />
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean | undefined;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center transition-colors ${active ? "text-orange-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-0.5">{label}</span>
    </Link>
  );
}
