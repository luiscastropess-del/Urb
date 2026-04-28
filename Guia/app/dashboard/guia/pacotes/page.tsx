"use client";

import { useEffect, useState, useCallback } from "react";
import { getGuidePackages, createTourPackage } from "@/app/actions.guide.packages";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { Wallet, Plus, Clock, MoreVertical, Edit2, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuidePackagesPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchPackages() {
      try {
        const data = await getGuidePackages();
        if (!mounted) return;
        setPackages(data);
      } catch (e: any) {
        showToast(`Erro ao buscar pacotes: ${e.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPackages();
    return () => { mounted = false; };
  }, [showToast, refreshTrigger]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    
    try {
      await createTourPackage({ title: newTitle, price: parseFloat(newPrice) });
      showToast("Pacote criado! Agora adicione os detalhes e roteiros.");
      setIsCreating(false);
      setNewTitle("");
      setNewPrice("");
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      showToast("Erro ao criar pacote.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">📦 Gerenciamento de Pacotes</h3>
            <button 
              onClick={() => setIsCreating(true)}
               className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-md hover:bg-orange-600 active:scale-95"
            >
               <i className="fas fa-plus mr-1"></i> Novo
            </button>
        </div>

      {loading ? (
        <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-orange-500 text-2xl"></i></div>
      ) : packages.length === 0 ? (
        <div className="text-center p-10 text-slate-500">
           Você ainda não possui pacotes. Clique em &quot;Novo&quot; para criar.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
           {packages.map(pkg => (
              <div key={pkg.id} className="border border-slate-200 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="flex justify-between items-start">
                     <h4 className="font-bold">{pkg.title}</h4>
                     <span className={`text-xs px-2 py-1 rounded-full ${pkg.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {pkg.status === 'PUBLISHED' ? "Ativo" : "Rascunho"}
                     </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {pkg._count?.reservations || 0} vendas · R$ {pkg.price.toFixed(2)}
                  </p>
                  <button 
                    onClick={() => router.push(`/dashboard/guia/pacotes/${pkg.id}`)}
                    className="mt-3 text-sm text-orange-500 hover:text-orange-600 transition"
                  >
                    <i className="fas fa-pen mr-1"></i> Editar
                  </button>
              </div>
           ))}
        </div>
      )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold mb-4">Novo Pacote</h2>
             <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome do Pacote</label>
                <input 
                  autoFocus
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Ex: Tour Completo"
                />
             </div>
             <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Valor (R$)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Ex: 320.00"
                />
             </div>
             <div className="flex gap-3">
               <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition">
                 Cancelar
               </button>
               <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition">
                 Salvar
               </button>
             </div>
           </form>
        </div>
      )}
    </div>
  );
}
