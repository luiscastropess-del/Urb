"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Database, 
  MapPin, 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Phone, 
  Globe, 
  Filter 
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function ProspectorPage() {
  const { showToast } = useToast();
  
  // States for Searching
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lastResults, setLastResults] = useState<any[]>([]);

  // States for History
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function checkHistory() {
      setIsHistoryLoading(true);
      try {
        const res = await fetch("/api/places");
        const data = await res.json();
        if (mounted && data.places) {
          setHistory(data.places);
        }
      } catch (e) {
        showToast("Erro ao carregar banco de locais");
      } finally {
        if (mounted) setIsHistoryLoading(false);
      }
    }
    checkHistory();
    return () => { mounted = false; };
  }, [showToast, refreshTrigger]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !category) {
      showToast("Preencha cidade e categoria");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category })
      });
      const data = await res.json();
      
      if (data.places) {
        setLastResults(data.places);
        showToast(`${data.places.length} locais adicionados ao resultado`);
        setRefreshTrigger(prev => prev + 1);
      } else if (data.message) {
        showToast(data.message);
      }
    } catch (e) {
      showToast("Falha na conexão com a API de prospecção");
    } finally {
      setIsSearching(false);
    }
  };

  const filteredHistory = history.filter(p => 
    p.name.toLowerCase().includes(filterTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prospector de Locais</h1>
          <p className="text-slate-500 mt-1">Encontre e salve os melhores locais para seus roteiros</p>
        </div>
        <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
          <Search size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card: Buscar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <Search size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Prospectar Agora</h2>
          </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Cidade</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ex: Holambra" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Categoria</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ex: Restaurante" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                {isSearching ? "Minerando Dados..." : "Prospectar Agora"}
              </button>
            </form>

            {lastResults.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-center gap-3">
                 <CheckCircle className="text-green-600" size={20} />
                 <p className="text-sm font-medium text-green-800 dark:text-green-300">{lastResults.length} locais encontrados e salvos.</p>
              </div>
            )}
          </div>

          {/* Card: Banco de Locais */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                  <Database size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Banco de Locais</h2>
              </div>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                {history.length} salvos
              </span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar por nome ou categoria..." 
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-xl text-xs focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 scroll-slim">
               {isHistoryLoading ? (
                 <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-300" /></div>
               ) : filteredHistory.length === 0 ? (
                 <p className="text-center text-slate-400 text-sm py-8">Nenhum local no banco ainda.</p>
               ) : (
                 filteredHistory.map((place) => (
                   <div key={place.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-500/50 transition cursor-pointer group">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                          <img src={place.photo_url || "https://picsum.photos/200"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{place.name}</h4>
                          <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{place.category}</span>
                          <p className="text-[10px] text-slate-400 truncate mt-1">{place.address}</p>
                        </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>

        </div>

      </div>
  );
}
