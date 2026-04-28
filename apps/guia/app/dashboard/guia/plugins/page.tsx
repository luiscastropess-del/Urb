"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { 
  Puzzle, 
  Search, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Info, 
  CheckCircle, 
  Download, 
  Filter,
  Sparkles,
  CloudSun,
  DollarSign,
  MessageSquare,
  Map as MapIcon,
  ShieldCheck,
  Zap,
  Globe,
  Settings
} from "lucide-react";
import { getPlugins, togglePlugin, seedPlugins } from "@/app/actions.plugins";
import { useToast } from "@/components/ToastProvider";

const ICON_MAP: Record<string, any> = {
  Sparkles,
  CloudSun,
  DollarSign,
  MessageSquare,
  Map: MapIcon,
  ShieldCheck,
  Zap,
  Globe
};

const COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const loadPlugins = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getPlugins();
      if (data.length === 0) {
        await seedPlugins();
        data = await getPlugins();
      }
      setPlugins(data);
    } catch (error) {
      console.error(error);
      showToast("❌ Erro ao carregar módulos");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  const handleToggle = async (slug: string, currentStatus: boolean) => {
    try {
      const result = await togglePlugin(slug, !currentStatus);
      if (result.success) {
        setPlugins(plugins.map(p => p.slug === slug ? { ...p, isActive: !currentStatus } : p));
        showToast(`${!currentStatus ? "✅ Módulo ativado" : "⚠️ Módulo desativado"}`);
      }
    } catch (error) {
      showToast("❌ Erro ao alterar status");
    }
  };

  const filteredPlugins = plugins.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section integrated into the scrollable flow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <Puzzle className="text-orange-500" /> Módulos & Plugins
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Personalize sua experiência de guia com funcionalidades extras.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            onClick={() => showToast("🛒 Marketplace em breve!")}
          >
            <Download size={18} /> Explorar Novos
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-lg">
           <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Puzzle size={24} />
           </div>
           <div>
              <p className="text-xs text-slate-500 font-medium">Total Instalados</p>
              <p className="text-2xl font-bold text-slate-800">{plugins.length}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-lg">
           <div className="h-12 w-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
              <CheckCircle size={24} />
           </div>
           <div>
              <p className="text-xs text-slate-500 font-medium">Ativos</p>
              <p className="text-2xl font-bold text-slate-800">{plugins.filter(p => p.isActive).length}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-lg">
           <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Zap size={24} />
           </div>
           <div>
              <p className="text-xs text-slate-500 font-medium">Recursos Beta</p>
              <p className="text-2xl font-bold text-slate-800">2</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar módulos..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
              <Filter size={18} />
              <span className="sm:hidden text-sm font-medium">Filtrar</span>
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors" onClick={loadPlugins}>
              <Plus size={18} />
              <span className="sm:hidden text-sm font-medium">Novo</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500 border-r-2 mb-4"></div>
              <p>Sincronizando biblioteca de módulos...</p>
            </div>
          ) : filteredPlugins.length > 0 ? (
            filteredPlugins.map((plugin) => {
              const manifest = JSON.parse(plugin.manifest || "{}");
              const Icon = ICON_MAP[manifest.icon] || Info;
              const colorClass = COLOR_MAP[manifest.color] || COLOR_MAP.blue;

              return (
                <div key={plugin.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex gap-2 mb-1 flex-wrap items-center">
                      <h3 className="font-bold text-slate-800 text-base">{plugin.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border border-slate-200">v{plugin.version}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 md:line-clamp-none">{plugin.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400 font-medium italic">
                      <span>Por: {plugin.author}</span>
                      <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                      <button className="text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1 transition-colors">Saiba mais <Info size={12} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2 sm:hidden">
                      <span className="text-xs font-semibold text-slate-500">
                        {plugin.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggle(plugin.slug, plugin.isActive)}
                        className={`flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${plugin.isActive ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        {plugin.isActive ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
                      </button>
                      <Link href={`/dashboard/guia/plugins/${plugin.slug}`} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                        <Settings size={20} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Puzzle className="text-slate-300" size={32} />
              </div>
              <p className="font-medium text-slate-600">Nenhum módulo encontrado</p>
              <p className="text-sm mt-1">Tente ajustar seus termos de pesquisa.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* External Modules Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
         <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
               <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">Desenvolva seus plugins</h2>
               <p className="text-indigo-100 text-sm sm:text-base mb-6 max-w-xl mx-auto md:mx-0 leading-relaxed">
                  Nossa API é aberta para desenvolvedores criarem extensões personalizadas. 
                  Adicione novas formas de visualização, prospectores específicos ou integrações de terceiros.
               </p>
               <Link href="/dashboard/guia/plugins/docs" className="inline-block w-full text-center sm:w-auto px-6 py-3.5 bg-white text-indigo-700 rounded-xl font-bold text-sm shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all active:scale-95">
                  Documentação API
               </Link>
            </div>
            <div className="hidden lg:block shrink-0">
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 grid grid-cols-2 gap-4 shadow-xl">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Zap size={24} /></div>
                  <div className="h-14 w-14 bg-white/80 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Globe size={24} /></div>
                  <div className="h-14 w-14 bg-white/80 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><ShieldCheck size={24} /></div>
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Puzzle size={24} /></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
