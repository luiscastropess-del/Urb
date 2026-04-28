"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getTourPackage, 
  updateTourPackageDetails,
  addRouteToPackage,
  removeRouteFromPackage
} from "@/app/actions.guide.packages";
import { getGuideRoutes } from "@/app/actions.guide.routes";
import { getAiAssistantConfig } from "@/app/actions.plugins";
import { useToast } from "@/components/ToastProvider";
import { GoogleGenAI } from "@google/genai";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Plus, 
  X, 
  Clock, 
  Image as ImageIcon,
  Star,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function PackageBuilderPage() {
  const { id } = useParams() as { id: string };
  const { showToast } = useToast();
  const router = useRouter();
  
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("1");
  const [maxPeople, setMaxPeople] = useState("10");
  const [status, setStatus] = useState("DRAFT");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Routes to select
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const pData = await getTourPackage(id);
        if (!mounted) return;
        if (pData) {
          setPkg(pData);
          setTitle(pData.title);
          setDescription(pData.description || "");
          setPrice(pData.price.toString());
          setDurationDays(pData.durationDays.toString());
          setMaxPeople(pData.maxPeople.toString());
          setStatus(pData.status);
        }
        
        const rData = await getGuideRoutes();
        if (mounted) setAvailableRoutes(rData);
      } catch (e) {
        showToast("Erro ao carregar pacote.");
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
      await updateTourPackageDetails(id, {
        title,
        description,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        maxPeople: parseInt(maxPeople),
        status
      });
      showToast("Pacote salvo com sucesso!");
    } catch (e) {
      showToast("Erro ao salvar.");
    } finally {
      setSaving(false);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleAddRoute = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    if(!rId) return;
    try {
      if(pkg.routes.find((r: any) => r.id === rId)) {
         showToast("Este roteiro já está no pacote");
         return;
      }
      await addRouteToPackage(id, rId);
      e.target.value = "";
      setRefreshTrigger(prev => prev + 1);
    } catch(e) {
      showToast("Erro ao adicionar roteiro.");
    }
  };

  const handleRemoveRoute = async (routeId: string) => {
    try {
      await removeRouteFromPackage(id, routeId);
      setRefreshTrigger(prev => prev + 1);
    } catch(e) {
      showToast("Erro ao remover roteiro.");
    }
  };

  const buyPremium = async () => {
     if(!confirm("Impulsionar pacote por R$99.90 mensais? O valor será descontado de seu saldo.")) return;
     try {
        await updateTourPackageDetails(id, { status: "PREMIUM" });
        showToast("Sucesso! Seu pacote agora é Premium.");
        setRefreshTrigger(prev => prev + 1);
     } catch(e) {
        showToast("Erro ao comprar PREMIUM.");
     }
  }

  const handleGenerateAIDescription = async () => {
    if (!title) {
        showToast("Defina um título para o pacote primeiro.");
        return;
    }
    if (pkg.routes.length === 0) {
        showToast("Adicione pelo menos um roteiro antes de gerar a descrição.");
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
        const routeTitles = pkg.routes.map((r: any) => r.title);
        
        const prompt = `Você é um guia turístico especializado em Holambra. 
          Use um tom de voz ${config.tone || "profissional"}.
          Gere uma descrição de venda atraente e persuasiva para um pacote turístico chamado "${title}" que inclui os seguintes roteiros: ${routeTitles.join(", ")}.
          A descrição deve ser profissional, convidativa e destacar a experiência única do turista.
          Mantenha entre 3 a 5 parágrafos. Use emojis de forma moderada.`;

        const response = await ai.models.generateContent({
          model: config.model || "gemini-3-flash-preview",
          contents: prompt,
        });

        if (response.text) {
          setDescription(response.text);
          showToast("Descrição gerada com IA!");
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

  if (loading || !pkg) return <div className="p-10 flex justify-center"><Clock className="animate-spin text-orange-500"/></div>;

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/guia/pacotes")}
            className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-colors hover:bg-slate-50 text-slate-600 shadow-sm shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              Configurar Pacote {pkg.status === "PREMIUM" && <Star size={20} className="fill-amber-500 text-amber-500"/>}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure os roteiros e detalhes para venda</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {pkg.status !== "PREMIUM" && (
            <button onClick={buyPremium} className="flex items-center justify-center w-full sm:w-auto gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 border border-amber-500 font-bold px-4 py-2.5 rounded-xl shadow-sm transition">
                <Star size={16} className="fill-slate-900"/> Impulsionar
            </button>
          )}

          <select 
             value={status}
             onChange={e => setStatus(e.target.value)}
             className="flex-1 min-w-[120px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:border-orange-500 shadow-sm"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            {pkg.status === "PREMIUM" && (
                <option value="PREMIUM">PREMIUM (Ativo)</option>
            )}
          </select>
          <button 
            disabled={saving}
            onClick={handleSaveDetails}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-70 active:scale-95"
          >
            {saving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Informações</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título do Pacote</label>
                  <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preço (R$)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duração (Dias)</label>
                       <input 
                         type="number"
                         value={durationDays}
                         onChange={e => setDurationDays(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Máx. Pessoas</label>
                       <input 
                         type="number"
                         value={maxPeople}
                         onChange={e => setMaxPeople(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                       />
                   </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição para venda</label>
                    <button 
                      onClick={handleGenerateAIDescription}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-all border border-purple-100"
                    >
                      {isGeneratingAI ? <Clock className="animate-spin" size={12} /> : <Sparkles size={12} />}
                      IA Assistente
                    </button>
                  </div>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                    placeholder="Venda seu pacote..."
                  />
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
               <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Roteiros Inclusos ({pkg.routes.length})</h3>
               
               <div className="mb-6 z-20">
                    <select
                      onChange={handleAddRoute}
                      defaultValue=""
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition-all font-medium text-slate-700"
                    >
                       <option value="" disabled>+ Adicionar Roteiro Existente ao Pacote</option>
                       {availableRoutes.filter(ar => ar.status === "PUBLISHED").map(r => (
                          <option key={r.id} value={r.id}>{r.title} ({r.durationMinutes} min)</option>
                       ))}
                    </select>
               </div>

               <div className="flex-1 space-y-3">
                   {pkg.routes.length === 0 ? (
                       <div className="text-center text-slate-400 mt-10 p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                          Este pacote ainda não tem roteiros inseridos.
                       </div>
                   ) : (
                       pkg.routes.map((r: any) => (
                           <div key={r.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center transition hover:border-slate-200 shadow-sm">
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 text-blue-500">
                                      <MapPin size={18} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{r.title}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">{r.places.length} locais de visitação</p>
                                  </div>
                               </div>
                               <button onClick={() => handleRemoveRoute(r.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition active:scale-95">
                                  <X size={18}/>
                               </button>
                           </div>
                       ))
                   )}
               </div>
           </div>
           
           <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4 text-slate-400">
                <ImageIcon size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Fotos do Pacote</h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">Em breve você poderá fazer upload de fotos exclusivas para destacar este pacote.</p>
              <button disabled className="px-5 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold text-sm shadow-sm cursor-not-allowed">Upload Indisponível</button>
           </div>
        </div>

      </div>
    </div>
  );
}
