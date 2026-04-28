"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getTourRoute, 
  updateTourRouteDetails, 
  searchPlacesForRoute, 
  addPlaceToRoute, 
  removePlaceFromRoute,
  updateRoutePlaceOrder
} from "@/app/actions.guide.routes";
import { getAiAssistantConfig } from "@/app/actions.plugins";
import { useToast } from "@/components/ToastProvider";
import { GoogleGenAI } from "@google/genai";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Search, 
  Plus, 
  X, 
  GripVertical, 
  Trash2, 
  Clock, 
  Info,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function RouteBuilderPage() {
  const { id } = useParams() as { id: string };
  const { showToast } = useToast();
  const router = useRouter();
  
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getTourRoute(id);
        if (!mounted) return;
        if (data) {
          setRoute(data);
          setTitle(data.title);
          setDescription(data.description || "");
          setDuration(data.durationMinutes ? data.durationMinutes.toString() : "");
          setStatus(data.status);
        }
      } catch (e) {
        showToast("Erro ao carregar roteiro.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, showToast, refreshTrigger]);

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      await updateTourRouteDetails(id, {
        title,
        description,
        durationMinutes: duration ? parseInt(duration) : null,
        status
      });
      showToast("Roteiro salvo com sucesso!");
    } catch (e) {
      showToast("Erro ao salvar.");
    } finally {
      setSaving(false);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleGenerateAIPresentation = async () => {
    if (!title) {
        showToast("Defina um título para o roteiro primeiro.");
        return;
    }
    if (route.places.length === 0) {
        showToast("Adicione pelo menos um local antes de gerar a apresentação.");
        return;
    }

    setIsGeneratingAI(true);
    try {
        const config = await getAiAssistantConfig();

        if (!config.apiKey) {
          showToast("Aviso: Chave de API Gemini não encontrada. Verifique as configurações.");
          setIsGeneratingAI(false);
          return;
        }

        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        const placeNames = route.places.map((rp: any) => rp.place.name);
        
        const prompt = `Você é um guia turístico especializado em Holambra. 
          Use um tom de voz ${config.tone || "profissional"}.
          Gere uma apresentação curta e envolvente para um roteiro turístico chamado "${title}" que visita os seguintes locais: ${placeNames.join(", ")}.
          A apresentação será lida pelo turista para entender o que ele verá.
          Seja vibrante e informativo. Use emojis.`;

        const response = await ai.models.generateContent({
          model: config.model || "gemini-3-flash-preview",
          contents: prompt,
        });

        if (response.text) {
          setDescription(response.text);
          showToast("Apresentação gerada com IA!");
        } else {
          showToast("A IA retornou uma resposta vazia.");
        }
    } catch (e: any) {
        console.error("AI Generation Error:", e);
        showToast(`Erro na IA: ${e.message || "Erro desconhecido"}`);
    } finally {
        setIsGeneratingAI(false);
    }
  };

  // Debounced search
  useEffect(() => {
    let mounted = true;
    if (searchQuery.length > 2) {
      const delay = setTimeout(async () => {
        if (!mounted) return;
        setSearching(true);
        try {
          const results = await searchPlacesForRoute(searchQuery);
          if (mounted) setSearchResults(results);
        } finally {
          if (mounted) setSearching(false);
        }
      }, 500);
      return () => {
        mounted = false;
        clearTimeout(delay);
      };
    } else {
      if (searchResults.length > 0) {
        Promise.resolve().then(() => setSearchResults([]));
      }
    }
  }, [searchQuery, searchResults.length]);

  const handleAddPlace = async (placeId: string) => {
    // Check if already in list
    if (route.places.some((rp: any) => rp.placeId === placeId)) {
        showToast("Este local já está no roteiro!");
        return;
    }
    
    try {
      await addPlaceToRoute(id, placeId);
      setSearchQuery("");
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      showToast("Erro ao adicionar local.");
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    try {
      await removePlaceFromRoute(id, placeId);
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      showToast("Erro ao remover local.");
    }
  };

  // Simple move up/down (since real drag and drop requires a lib like dnd-kit)
  const movePlace = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === route.places.length - 1) return;

    const newPlaces = [...route.places];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newPlaces[index];
    newPlaces[index] = newPlaces[swapIndex];
    newPlaces[swapIndex] = temp;

    // Update orders
    const updates = newPlaces.map((rp, idx) => ({ placeId: rp.placeId, order: idx }));
    
    // Optimistic UI
    setRoute({ ...route, places: newPlaces });
    
    try {
      await updateRoutePlaceOrder(id, updates);
    } catch(e) {
      showToast("Erro ao reordenar.");
      setRefreshTrigger(prev => prev + 1); // revert
    }
  };

  if (loading || !route) return <div className="p-10 flex justify-center"><Clock className="animate-spin text-orange-500"/></div>;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/guia/roteiros" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 font-medium text-sm transition">
        <ArrowLeft size={16} /> Voltar para Roteiros
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">Construtor de Roteiro</h1>
        <div className="flex items-center gap-3">
          <select 
             value={status}
             onChange={e => setStatus(e.target.value)}
             className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-800"
          >
            <option value="DRAFT">Rascunho (Privado)</option>
            <option value="PUBLISHED">Publicado (Visível nos pacotes)</option>
          </select>
          <button 
            disabled={saving}
            onClick={handleSaveDetails}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition disabled:bg-slate-300"
          >
            {saving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold mb-4 border-b border-slate-100 pb-2">Informações Básicas</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Título do Roteiro</label>
                  <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Duração Média (Minutos)</label>
                  <input 
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="Ex: 120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-800"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Apresentação para o turista</label>
                    <button 
                      onClick={handleGenerateAIPresentation}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-all border border-purple-100"
                    >
                      {isGeneratingAI ? <Clock className="animate-spin" size={12} /> : <Sparkles size={12} />}
                      Gerar com IA
                    </button>
                  </div>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-800 resize-none"
                    placeholder="Escreva um roteiro atraente..."
                  />
                </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
             <h3 className="font-bold mb-3 border-b border-slate-100 pb-2">Vincular a Pacotes</h3>
             <p className="text-xs text-slate-500 mb-4">Vincule este roteiro a um dos seus pacotes. Você também pode fazer isso gerindo o Pacote.</p>
             <button onClick={() => router.push("/dashboard/guia/pacotes")} className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 py-2.5 rounded-xl text-sm font-bold transition-colors">
               Ir para Meus Pacotes
             </button>
           </div>
           
           <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
             <h4 className="font-bold flex items-center gap-2 text-amber-700 mb-2">
               <Info size={16} /> Dica de Ouro
             </h4>
             <p className="text-sm text-amber-800/80 leading-relaxed">
               Locais com fotos na nossa base são mais atrativos. Caso queira um ponto turístico que não existe aqui, peça para um administrador adicioná-lo ou usar o &quot;Mapeador de Locais&quot;.
             </p>
           </div>
        </div>

        {/* Right Column: Path/Places Builder */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
              <h3 className="font-bold mb-4">Caminho do Roteiro ({route.places.length} locais)</h3>
              
              {/* Search Bar */}
              <div className="relative mb-6 z-20">
                 <div className="relative">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar local para adicionar ao roteiro..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-4 py-3 text-sm transition outline-none"
                   />
                 </div>
                 
                 {searchQuery.length > 2 && (
                   <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                     {searching ? (
                       <div className="p-4 text-center text-sm text-slate-500">Buscando...</div>
                     ) : searchResults.length === 0 ? (
                       <div className="p-4 text-center text-sm text-slate-500">Nenhum local encontrado.</div>
                     ) : (
                       searchResults.map(res => (
                         <div key={res.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer text-sm">
                            <div className="flex items-center gap-3">
                              {res.coverImage ? (
                                <img src={res.coverImage} referrerPolicy="no-referrer" className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">{res.emoji}</div>
                              )}
                              <div>
                                <p className="font-bold truncate max-w-[200px]">{res.name}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{res.address}</p>
                              </div>
                            </div>
                            <button onClick={() => handleAddPlace(res.id)} className="p-1.5 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg transition">
                               <Plus size={16} />
                            </button>
                         </div>
                       ))
                     )}
                   </div>
                 )}
              </div>

              {/* Path List */}
              <div className="flex-1 space-y-3 relative z-10">
                 {route.places.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-10">
                      <MapPin size={48} className="mb-4 opacity-20" />
                      <p>O roteiro está vazio.</p>
                      <p className="text-xs">Busque locais acima e defina a ordem de visitação.</p>
                   </div>
                 ) : (
                   route.places.map((rp: any, index: number) => (
                     <div key={rp.placeId} className="flex items-center gap-3 group relative">
                        {/* Timeline visual */}
                        <div className="flex flex-col items-center justify-center w-6 shrink-0 h-full absolute -left-8">
                           <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center relative z-10">
                              {index + 1}
                           </div>
                           {index < route.places.length - 1 && (
                             <div className="w-0.5 h-16 bg-slate-200 absolute top-6 bottom-0 -z-10" />
                           )}
                        </div>

                        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 hover:border-slate-300 transition ml-8">
                           {/* Controls */}
                           <div className="flex flex-col gap-1 shrink-0 text-slate-300 group-hover:text-slate-500">
                             <button onClick={() => movePlace(index, 'up')} disabled={index === 0} className="hover:text-orange-500 disabled:opacity-20"><GripVertical size={14} /></button>
                             <button onClick={() => movePlace(index, 'down')} disabled={index === route.places.length - 1} className="hover:text-orange-500 disabled:opacity-20"><GripVertical size={14} /></button>
                           </div>
                           
                           {/* Place Info */}
                           <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center">
                              {rp.place.coverImage ? (
                                <img src={rp.place.coverImage} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl">{rp.place.emoji}</span>
                              )}
                           </div>
                           <div className="flex-1">
                              <h4 className="font-bold text-sm">{rp.place.name}</h4>
                              <p className="text-xs text-slate-500 truncate max-w-[250px]">{rp.place.address}</p>
                           </div>

                           {/* Delete */}
                           <button onClick={() => handleRemovePlace(rp.placeId)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition shrink-0">
                              <X size={16} />
                           </button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
