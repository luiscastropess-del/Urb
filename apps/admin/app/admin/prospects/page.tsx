"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ToastProvider";
import { Loader2, Search, Trash2, MapPin, Sparkles, Filter, MoreVertical, Edit2, CheckSquare, Square, PieChart, Tag } from "lucide-react";

export default function ProspectsPage() {
  const { showToast } = useToast();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filtros
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("TODAS");
  const [filterCategory, setFilterCategory] = useState("TODAS");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState("");

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/prospects");
      const data = await res.json();
      if (data.places) {
        setPlaces(data.places);
      }
    } catch (e) {
      showToast("Erro ao carregar prospectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const cities = useMemo(() => {
    const list = new Set(places.map(p => p.city).filter(Boolean));
    return Array.from(list);
  }, [places]);

  const categories = useMemo(() => {
    const list = new Set(places.map(p => p.type).filter(Boolean));
    return Array.from(list);
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.address?.toLowerCase().includes(search.toLowerCase());
      const matchCity = filterCity === "TODAS" || p.city === filterCity;
      const matchCategory = filterCategory === "TODAS" || p.type === filterCategory;
      return matchSearch && matchCity && matchCategory;
    });
  }, [places, search, filterCity, filterCategory]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPlaces.length && filteredPlaces.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPlaces.map(p => p.id)));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'enrich') => {
    if (selectedIds.size === 0) return showToast("Nenhum local selecionado");

    if (action === 'delete') {
      if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} locais?`)) return;
      
      setIsProcessing(true);
      setProcessMessage("Excluindo locais...");
      try {
        const res = await fetch("/api/admin/prospects/bulk", {
          method: "POST",
          body: JSON.stringify({ action: "delete", ids: Array.from(selectedIds) })
        });
        const data = await res.json();
        if (data.success) {
           showToast(data.message);
           setSelectedIds(new Set());
           loadPlaces();
        } else {
           showToast(data.error || "Erro");
        }
      } catch (e) {
         showToast("Erro na requisição");
      } finally {
        setIsProcessing(false);
      }
    }

    if (action === 'enrich') {
      setIsProcessing(true);
      setProcessMessage("A Mágica da IA está enriquecendo seus locais. Isso pode levar alguns minutos...");
      try {
        const res = await fetch("/api/admin/prospects/enrich", {
          method: "POST",
          body: JSON.stringify({ ids: Array.from(selectedIds) })
        });
        const data = await res.json();
        if (data.success) {
           showToast(data.message);
           setSelectedIds(new Set());
           loadPlaces();
        } else {
           showToast(data.error || "Erro ao enriquecer");
        }
      } catch (e) {
         showToast("Erro na requisição de enriquecimento");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getCompletenessColor = (percent: number) => {
    if (percent >= 80) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (percent >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
      <header className="px-5 md:px-8 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg text-white">
               <PieChart size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Prospecção LoteMassa</h1>
              <p className="text-sm text-slate-500 font-medium">Bancada de enriquecimento e tratamento</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 hover:border-rose-200 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={16} /> <span className="hidden sm:inline">Excluir</span> ({selectedIds.size})
            </button>
            <button 
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={() => handleBulkAction('enrich')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles size={16} /> Enriquecer com IA ({selectedIds.size})
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por nome ou endereço..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
           </div>
           <div className="flex gap-2 shrink-0">
             <select 
               value={filterCity}
               onChange={(e) => setFilterCity(e.target.value)}
               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
             >
               <option value="TODAS">📍 Todas Cidades</option>
               {cities.map((city: any) => <option key={city} value={city}>{city}</option>)}
             </select>
             <select 
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
             >
               <option value="TODAS">🏷️ Todas Categorias</option>
               {categories.map((cat: any) => <option key={cat} value={cat}>{cat}</option>)}
             </select>
           </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 md:p-8">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Carregando banco de prospectos...</p>
           </div>
        ) : filteredPlaces.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500">
              <Filter className="mb-4 opacity-50" size={48} />
              <p className="font-semibold text-lg">Nenhum prospecto encontrado</p>
              <p className="text-sm">Ajuste os filtros ou importe novos dados no Mapeador.</p>
           </div>
        ) : (
           <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <tr>
                      <th className="p-4 w-10">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-500">
                          {selectedIds.size === filteredPlaces.length && filteredPlaces.length > 0 ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} />}
                        </button>
                      </th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-xs">Local</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-xs">Completude</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-xs">Categoria</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-xs">Cidade</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-xs">Atualizado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPlaces.map(place => (
                      <tr 
                        key={place.id} 
                        onClick={() => toggleSelect(place.id)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition ${selectedIds.has(place.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
                      >
                         <td className="p-4">
                           {selectedIds.has(place.id) ? <CheckSquare size={18} className="text-indigo-500" /> : <Square size={18} className="text-slate-300 dark:text-slate-600" />}
                         </td>
                         <td className="p-4">
                           <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                               {place.coverImage ? (
                                 <img src={place.coverImage} className="w-full h-full object-cover" alt={place.name} />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">{place.emoji || "📍"}</div>
                               )}
                             </div>
                             <div>
                               <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">{place.name}</p>
                               <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-[300px]">{place.address}</p>
                             </div>
                           </div>
                         </td>
                         <td className="p-4">
                           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getCompletenessColor(place.completeness)}`}>
                              <PieChart size={12} /> {place.completeness}%
                           </div>
                           {place.completeness < 50 && <span className="ml-2 text-[10px] text-amber-500">Exige Enriquecimento</span>}
                         </td>
                         <td className="p-4">
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                             <Tag size={14} /> {place.type || 'N/A'}
                           </div>
                         </td>
                         <td className="p-4">
                           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                             <MapPin size={14} /> {place.city || 'N/A'}
                           </div>
                         </td>
                         <td className="p-4 text-slate-500 text-xs">
                           {new Date(place.updatedAt).toLocaleDateString('pt-BR')}
                         </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        )}
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
              <Sparkles className="text-indigo-500 animate-pulse mb-4" size={48} />
              <h3 className="font-bold text-xl mb-2">Processando...</h3>
              <p className="text-slate-500 text-sm mb-6">{processMessage}</p>
              <Loader2 className="animate-spin text-slate-400" size={24} />
           </div>
        </div>
      )}
    </div>
  );
}
