"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Database, Search, MapPin, List, Download, CloudUpload, History, Store, Loader2, Star, MessageCircle, DollarSign, Clock } from "lucide-react";

export default function ImportPlacesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState("10");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dataSource, setDataSource] = useState<"google" | "prospect">("google");
  
  // Status de importação
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importText, setImportText] = useState("");

  const searchPlaces = async () => {
    if (!city || !category) return showToast("⚠️ Preencha cidade e categoria");
    
    setLoading(true);
    setDataSource("google");
    setPlaces([]);
    
    try {
      const res = await fetch("/api/admin/search-places", {
        method: "POST",
        body: JSON.stringify({ city, category, radius: parseInt(radius) })
      });
      const data = await res.json();
      
      if (data.error) {
        if (data.error.includes("This API is not activated") || data.error.includes("not been used in project") || data.error.includes("PERMISSION_DENIED")) {
           showToast("⚠️ API do Google desativada! Ative no Google Cloud.");
        } else {
           showToast(`❌ Erro: ${data.error}`);
        }
      } else if (data.places && data.places.length > 0) {
        setPlaces(data.places);
        showToast(`📍 ${data.places.length} locais encontrados`);
      } else {
         showToast("Busca vazia ou nenhum local encontrado");
      }
    } catch (e) {
      showToast("❌ Erro interno de conexão");
    } finally {
      setLoading(false);
    }
  };

  const fetchProspect = async () => {
    if (!city || !category) return showToast("⚠️ Preencha cidade e categoria para mapear o OSM");

    setLoading(true);
    setDataSource("prospect");
    setPlaces([]);
    
    try {
      const res = await fetch("/api/admin/search-prospect", {
        method: "POST",
        body: JSON.stringify({ city, category })
      });
      const data = await res.json();
      
      if (data.error) {
         showToast(`❌ Erro: ${data.error}`);
      } else if (data.places && data.places.length > 0) {
        setPlaces(data.places);
        showToast(`📍 ${data.places.length} locais prospectados encontrados`);
      } else {
         showToast("A lista de prospecção está vazia no momento.");
      }
    } catch (e) {
      showToast("❌ Erro interno de conexão com a API de Prospect");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsOnly = async () => {
    setLoading(true);
    setDataSource("prospect");
    setPlaces([]);
    
    try {
      const res = await fetch("/api/admin/search-prospect"); // Chama o GET que já busca direto o result
      const data = await res.json();
      
      if (data.error) {
         showToast(`❌ Erro: ${data.error}`);
      } else if (data.places && data.places.length > 0) {
        setPlaces(data.places);
        showToast(`📍 ${data.places.length} locais encontrados no buffer de prospect`);
      } else {
         showToast("Nenhum dado novo no prospect no momento.");
      }
    } catch (e) {
      showToast("❌ Erro interno de conexão com a API Prospect");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string, imported: boolean) => {
    if (imported) return; // Travar locais que já existem
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    const newSet = new Set<string>();
    places.filter(p => !p.alreadyImported).forEach(p => newSet.add(p.id));
    setSelectedIds(newSet);
  };

  const performImport = async (idsToImport: string[]) => {
    if (idsToImport.length === 0) return showToast("Nenhum local selecionado");
    
    setIsImporting(true);
    let successCount = 0;
    
    // Tratamento e isolamento da variável estado/cidade do envio pro Prisma
    const cityParsed = city.split(',')[0].trim();
    const stateParsed = city.split(',')[1]?.trim() || "SP";

    const isProspect = dataSource === "prospect";

    for (let i = 0; i < idsToImport.length; i++) {
       const placeId = idsToImport[i];
       const pData = places.find(p => p.id === placeId);
       
       setImportProgress(((i + 1) / idsToImport.length) * 100);
       setImportText(`Baixando imagens e dados: ${pData?.name}...`);
       
       try {
         const endpoint = isProspect ? "/api/admin/import-prospect" : "/api/admin/import-single";
         const body = isProspect 
            ? JSON.stringify({ ...pData, city: cityParsed, state: stateParsed })
            : JSON.stringify({ placeId, city: cityParsed, state: stateParsed });

         const res = await fetch(endpoint, {
           method: "POST",
           body
         });
         const data = await res.json();
         if (data.success) successCount++;
       } catch (e) {
         console.error("Error importing", placeId);
       }
    }
    
    setIsImporting(false);
    showToast(`✅ ${successCount} locais importados!`);
    setSelectedIds(new Set());
    
    // Roda novamente a busca para riscar como importados
    if (isProspect) {
      fetchProspect();
    } else {
      searchPlaces();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 relative">
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3 pl-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
               <Database className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold">Mapeador de Locais</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-24 feed-scroll">
         {/* Formulário */}
         <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-4 mt-4 mb-5 shadow-sm">
             <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Search size={16} className="text-green-500" /> Buscar (OpenStreetMap Privado)
             </h3>
             <div className="space-y-3">
               <div>
                 <label className="text-xs font-medium text-slate-500">Cidade (Nome, UF)</label>
                 <div className="relative">
                   <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input value={city} onChange={e=>setCity(e.target.value)} type="text" placeholder="Holambra, SP" className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl py-3 pl-10 pr-3 text-sm focus:ring-2 focus:ring-green-500/50 outline-none" />
                 </div>
               </div>
               <div>
                 <label className="text-xs font-medium text-slate-500">Categoria / Busca</label>
                 <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500/50 outline-none">
                    <option value="">Selecione...</option>
                    <option value="restaurant">🍽️ Restaurante</option>
                    <option value="cafe">☕ Café</option>
                    <option value="tourist_attraction">🎡 Atração Turística</option>
                    <option value="park">🌳 Parque</option>
                    <option value="hotel">🏨 Hotel / Hospedagem</option>
                 </select>
               </div>
               <div className="flex gap-2">
                 <button onClick={fetchProspect} disabled={loading} className="flex-[3] py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold text-sm shadow flex items-center justify-center gap-2">
                   {loading && dataSource === 'prospect' ? <Loader2 className="animate-spin" size={16}/> : <Database size={16}/>}
                   Mapear (OpenStreetMap)
                 </button>
                 <button onClick={searchPlaces} disabled={loading} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-semibold text-xs shadow flex items-center justify-center gap-2">
                   {loading && dataSource === 'google' ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>} 
                   Enriquecer Google
                 </button>
               </div>
               <button onClick={fetchResultsOnly} disabled={loading} className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 mt-2">
                 <History size={16} /> Prospect (Importar resultados atuais)
               </button>
             </div>
         </div>

         {/* Resultados */}
         {places.length > 0 && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <List size={16} className="text-blue-500" /> {places.length} listados
                </h3>
                <button onClick={selectAll} className="text-xs text-blue-500 font-medium">Selecionar todos novos</button>
              </div>

              <div className="space-y-3 mb-5">
                 {places.map(place => (
                   <div key={place.id} onClick={() => toggleSelect(place.id, place.alreadyImported)} className={`bg-white/70 dark:bg-slate-800/70 border rounded-xl p-3 cursor-pointer transition ${selectedIds.has(place.id) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-white/30 dark:border-white/10'} ${place.alreadyImported ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center flex-shrink-0 ${selectedIds.has(place.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                           {selectedIds.has(place.id) && <Loader2 size={12} className={isImporting ? 'animate-spin' : 'hidden'} />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm truncate flex items-center gap-2">
                              {place.name} 
                              {place.alreadyImported && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded px-1">Importado</span>}
                           </h4>
                           <p className="text-xs text-slate-500 truncate">{place.address}</p>
                           <div className="flex gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400"/> {place.rating}</span>
                              <span className="flex items-center gap-1"><MessageCircle size={12}/> {place.reviews}</span>
                              {place.priceLevel && <span className="flex items-center gap-1"><DollarSign size={12} /> {place.priceLevel}</span>}
                           </div>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Float Fixer */}
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-4 sticky bottom-6 shadow-xl">
                 <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="font-bold">{selectedIds.size} locais selecionados</span>
                 </div>
                 <button disabled={selectedIds.size === 0 || isImporting} onClick={() => performImport(Array.from(selectedIds))} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-green-500 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">
                    {isImporting ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                    {isImporting ? "Extraindo dados do Google..." : "Processar Importação Global"}
                 </button>
              </div>
           </div>
         )}
      </div>

      {/* Modal Bloqueador de Progresso Escuro */}
      {isImporting && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-5">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <CloudUpload size={48} className="mx-auto text-blue-500 mb-4 animate-bounce" />
              <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Motor Trabalhando</h3>
              <p className="text-sm text-slate-500 mb-6">{importText}</p>
              
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${importProgress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"></div>
              </div>
              <p className="text-xs font-bold text-blue-500 mt-2">{Math.round(importProgress)}%</p>
           </div>
        </div>
      )}
    </div>
  );
}
