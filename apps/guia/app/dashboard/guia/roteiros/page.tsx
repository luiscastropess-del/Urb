"use client";

import { useEffect, useState, useCallback } from "react";
import { getGuideRoutes, createTourRoute } from "@/app/actions.guide.routes";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { MapPin, Plus, Clock, Package, MoreVertical, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuideRoutesPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchRoutes() {
      try {
        const data = await getGuideRoutes();
        if (!mounted) return;
        setRoutes(data);
      } catch (e) {
        showToast("Erro ao buscar roteiros. Certifique-se de estar aprovado como guia.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRoutes();
    return () => { mounted = false; };
  }, [showToast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const route = await createTourRoute({ title: newTitle });
      showToast("Roteiro criado! Agora adicione os locais.");
      router.push(`/dashboard/guia/roteiros/${route.id}`);
    } catch (e) {
      showToast("Erro ao criar roteiro.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">🗺️ Roteiros</h3>
            <button 
              onClick={() => setIsCreating(true)}
               className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-md hover:bg-orange-600 active:scale-95"
            >
               <i className="fas fa-plus mr-1"></i> Novo
            </button>
        </div>

      {loading ? (
        <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-orange-500 text-2xl"></i></div>
      ) : routes.length === 0 ? (
        <div className="text-center p-10 text-slate-500">
           Você ainda não possui roteiros.
        </div>
      ) : (
        <div className="space-y-4">
           {routes.map(route => (
              <div key={route.id} className="flex items-center justify-between border border-slate-200 rounded-xl p-4 transition hover:bg-slate-50">
                  <div>
                    <i className="fas fa-route text-orange-500 mr-2"></i>
                    <span className="font-medium">{route.title} {route.durationMinutes ? `(${route.durationMinutes} min)` : ''}</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/dashboard/guia/roteiros/${route.id}`)}
                    className="text-sm text-orange-500 hover:text-orange-600 transition"
                  >
                    <i className="fas fa-pen"></i>
                  </button>
              </div>
           ))}
        </div>
      )}
      </div>

      {/* Modal Criar Roteiro */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold mb-4">Novo Roteiro</h2>
             <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Nome do Roteiro</label>
                <input 
                  autoFocus
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Ex: Tour Histórico Moinho + Centrinho..."
                />
             </div>
             <div className="flex gap-3">
               <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition">
                 Cancelar
               </button>
               <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition">
                 Iniciar Criação
               </button>
             </div>
           </form>
        </div>
      )}
    </div>
  );
}
