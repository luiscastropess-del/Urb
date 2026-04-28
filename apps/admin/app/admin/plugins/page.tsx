"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { Loader2, Box, Trash2, Power, Globe, PlusCircle, Link as LinkIcon, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";
import { getPlugins, deletePlugin, togglePluginStatus } from "@/app/actions.plugins";

export default function InstalledPlugins() {
  const { showToast } = useToast();
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPlugins();
      setPlugins(data);
    } catch (e: any) {
      showToast("Erro ao carregar plugins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await togglePluginStatus(id, !current);
      showToast(current ? "Plugin desativado" : "Plugin ativado");
      load();
    } catch (e) {
      showToast("Erro ao alternar status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desinstalar este plugin?")) return;
    try {
      await deletePlugin(id);
      showToast("Plugin desinstalado");
      load();
    } catch (e) {
      showToast("Erro ao deletar plugin");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
      <header className="px-5 md:px-8 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg text-white">
               <Box size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Meus Plugins</h1>
              <p className="text-sm text-slate-500 font-medium">Gerencie suas extensões e ferramentas adicionais</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             <Link 
               href="/admin/plugins/market"
               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-md"
             >
               <PlusCircle size={16} /> Marketplace
             </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 md:p-8">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Carregando plugins...</p>
           </div>
        ) : plugins.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 max-w-2xl mx-auto">
              <Layers className="mb-4 opacity-50" size={48} />
              <p className="font-semibold text-lg text-slate-900 dark:text-white">Nenhum plugin instalado</p>
              <p className="text-sm text-center px-4 mt-2 mb-6">Você ainda não tem nenhum plugin. Visite o marketplace para turbinar seu sistema com novos recursos.</p>
              <Link href="/admin/plugins/market" className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center gap-2 hover:underline">
                 Ir para o Marketplace <Globe size={16} />
              </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
             {plugins.map(plugin => (
               <div key={plugin.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                          <Box size={18} className="text-indigo-500" /> {plugin.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">v{plugin.version} • {plugin.author || 'Autor Parceiro'}</p>
                     </div>
                     <button
                        onClick={() => handleToggle(plugin.id, plugin.isActive)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${plugin.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
                     >
                        <Power size={12} /> {plugin.isActive ? 'Ativo' : 'Inativo'}
                     </button>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                    {plugin.description || "Nenhuma descrição fornecida para este plugin."}
                  </p>

                  <div className="flex border-t border-slate-100 dark:border-slate-700 pt-4 gap-2">
                     {plugin.isActive && (
                       <Link 
                         href={`/admin/plugins/run/${plugin.slug}`}
                         className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition text-slate-700 dark:text-slate-300"
                       >
                         <LinkIcon size={16} /> Abrir
                       </Link>
                     )}
                     <button 
                       onClick={() => handleDelete(plugin.id)}
                       className={`${plugin.isActive ? 'px-3' : 'flex-1'} py-2 flex justify-center items-center bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 rounded-lg text-sm font-semibold transition`}
                     >
                       <Trash2 size={16} /> {!plugin.isActive && <span className="ml-2">Desinstalar</span>}
                     </button>
                  </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
