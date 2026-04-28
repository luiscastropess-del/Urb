"use client";

import { useToast } from "@/components/ToastProvider";
import { Moon, Bell, Search, MapPin, Compass, Star, ShieldCheck, Heart, Users, ArrowRight, CheckCircle, Languages, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { getGuides } from "@/app/actions.tours";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function GuiasLocaisPage() {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuides().then((guidesData) => {
      setGuides(guidesData);
      setLoading(false);
    });
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <MapPin className="text-emerald-500" size={12} />
                <span className="text-sm font-medium">Holambra, SP 🌷</span>
              </div>
              <h1 className="text-xl font-bold">Guias Locais</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <Moon className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
            <button
              onClick={() => showToast("🔔 Notificações")}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <Bell className="text-slate-600 dark:text-slate-300" size={18} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar guias por nome, idioma ou especialidade..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 outline-none"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 feed-scroll px-5 mt-4">
        
        <div className="mb-6">
          <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
             Guias Verificados
          </h2>
          <p className="text-slate-500 text-sm mt-1">Conheça nossos especialistas locais e agende experiências inesquecíveis.</p>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
             <p className="font-medium">Carregando guias...</p>
           </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide: any) => {
              const profileImage = guide.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.user?.name || 'Guia')}&size=200&background=10B981&color=fff`;
              const languages = (guide.languages as string[]) || ["Português"];
              const cleanLanguages = languages.map((lang: string) => lang.replace(/^\{|\}$/g, ''));
              // Stable random fallback for reviews
              const totalReviews = Math.floor((guide.user?.id?.length || 0) % 40) + 10;
              const rating = typeof guide.rating === "number" ? guide.rating.toFixed(1) : (guide.rating || "5.0");

              return (
                <Link key={guide.id} href={`/guias/${guide.id}`} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition-shadow group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 dark:border-slate-700">
                      <Image src={profileImage} alt={guide.user?.name || 'Guia'} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-xs">
                        {guide.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            <ShieldCheck size={12} /> Verificado
                          </span>
                        )}
                        {(guide.plan === 'pro' || guide.plan === 'ultimate') && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                            <Star size={12} className="fill-amber-600" /> Destaque
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{guide.user?.name || 'Guia Local'}</h3>
                      <div className="flex items-center gap-1 mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span>{rating}</span>
                        <span className="text-slate-400 font-normal">({totalReviews})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[40px] mb-4">
                    {guide.bio || "Guia especialista apaixonado por compartilhar experiências."}
                  </p>

                  <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                     {cleanLanguages.slice(0, 3).map((lang: string, i: number) => (
                        <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md whitespace-nowrap">
                          {lang}
                        </span>
                     ))}
                     {cleanLanguages.length > 3 && (
                        <span className="text-[10px] uppercase font-bold text-slate-400">+{cleanLanguages.length - 3}</span>
                     )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                       <LayoutGrid size={16} />
                       <span>{guide.packages?.length || 0} pacotes</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
             <Users className="text-slate-300 dark:text-slate-700 mb-3" size={48} />
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhum guia encontrado</h3>
             <p className="text-sm text-slate-500">Ainda não temos guias verificados registrados na plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
}
