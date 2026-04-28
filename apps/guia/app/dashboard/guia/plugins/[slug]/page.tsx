"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Puzzle, ShieldAlert } from "lucide-react";
import { getPluginBySlug, updatePluginSettings } from "@/app/actions.plugins";
import { useToast } from "@/components/ToastProvider";

export default function PluginSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const slug = use(params).slug;
  const [plugin, setPlugin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [configParams, setConfigParams] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      try {
        const data = await getPluginBySlug(slug);
        if (data) {
          setPlugin(data);
          if (data.settings) {
            setConfigParams(JSON.parse(data.settings));
          } else {
            // Default configs based on known plugins
            if (slug === 'ai-assistant') setConfigParams({ apiKey: '', model: 'gemini-1.5-pro', tone: 'professional' });
            else if (slug === 'weather-widget') setConfigParams({ apiKey: '', region: 'Holambra' });
            else if (slug === 'currency-converter') setConfigParams({ baseCurrency: 'BRL', updateFrequency: 'daily' });
            else if (slug === 'pagdev-gateway') setConfigParams({ env: 'sandbox', autoApprove: true });
            else if (slug === 'realtime-chat') setConfigParams({ enableNotifications: true, greetingMessage: 'Olá! Como posso ajudar na sua viagem?' });
            else if (slug === 'map-analytics') setConfigParams({ trackViews: true, heatmapPrecision: 'high' });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const result = await updatePluginSettings(slug, JSON.stringify(configParams));
      if (result.success) {
        showToast("✅ Configurações salvas com sucesso!");
        router.push("/dashboard/guia/plugins");
      } else {
        showToast("❌ Erro ao salvar configurações.");
      }
    } catch {
      showToast("❌ Erro ao salvar configurações.");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loading) {
     return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
     );
  }

  if (!plugin) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex flex-col items-center">
        <ShieldAlert size={40} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Plugin não encontrado</h2>
        <button onClick={() => router.back()} className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-sm mt-4">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-colors hover:bg-slate-50 text-slate-600 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Configurações: {plugin.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ajuste os parâmetros do plugin para sua conta</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="space-y-6">
          
          {slug === 'ai-assistant' && (
            <>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chave de API (Gemini/OpenAI)</label>
                  <input 
                    type="password" 
                    value={configParams.apiKey || ''} 
                    onChange={e => setConfigParams({...configParams, apiKey: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-slate-500 mt-1">Sua chave é salva de forma criptografada e usada apenas para suas operações.</p>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Modelo preferido</label>
                  <select 
                    value={configParams.model || ''}
                    onChange={e => setConfigParams({...configParams, model: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tom de voz da inteligência artificial</label>
                  <select 
                    value={configParams.tone || ''}
                    onChange={e => setConfigParams({...configParams, tone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="professional">Profissional e Informativo</option>
                    <option value="friendly">Amigável e Descontraído</option>
                    <option value="poetic">Poético e Inspirador</option>
                  </select>
               </div>
            </>
          )}

          {slug === 'weather-widget' && (
             <>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">API Key (OpenWeatherMap)</label>
                  <input 
                    type="password" 
                    value={configParams.apiKey || ''} 
                    onChange={e => setConfigParams({...configParams, apiKey: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                    placeholder="Sua chave API..."
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Região Padrão</label>
                  <input 
                    type="text" 
                    value={configParams.region || ''} 
                    onChange={e => setConfigParams({...configParams, region: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                    placeholder="Ex: Holambra, SP"
                  />
               </div>
             </>
          )}

          {slug === 'pagdev-gateway' && (
             <>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Modo</label>
                  <select 
                    value={configParams.env || ''}
                    onChange={e => setConfigParams({...configParams, env: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="sandbox">Sandbox (Testes)</option>
                    <option value="production">Produção (Simulado mas com travas falsas)</option>
                  </select>
               </div>
               <label className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={configParams.autoApprove || false} 
                    onChange={e => setConfigParams({...configParams, autoApprove: e.target.checked})}
                    className="w-5 h-5 accent-orange-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Aprovação automática</span>
                    <span className="text-xs text-slate-500 font-medium">Aprovar todos os pagamentos em modo teste instantaneamente, sem delay.</span>
                  </div>
               </label>
             </>
          )}

          {slug === 'currency-converter' && (
             <>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Moeda Base</label>
                  <select 
                    value={configParams.baseCurrency || ''}
                    onChange={e => setConfigParams({...configParams, baseCurrency: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Frequência de atualização de cotação</label>
                  <select 
                    value={configParams.updateFrequency || ''}
                    onChange={e => setConfigParams({...configParams, updateFrequency: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="hourly">De hora em hora</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                  </select>
               </div>
             </>
          )}

          {slug === 'realtime-chat' && (
             <>
               <label className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl cursor-pointer mb-4">
                  <input 
                    type="checkbox" 
                    checked={configParams.enableNotifications || false} 
                    onChange={e => setConfigParams({...configParams, enableNotifications: e.target.checked})}
                    className="w-5 h-5 accent-orange-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Ativar Notificações</span>
                    <span className="text-xs text-slate-500 font-medium">Receba avisos na tela quando um cliente mandar mensagem.</span>
                  </div>
               </label>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem de Recepção Automática</label>
                  <textarea 
                    value={configParams.greetingMessage || ''} 
                    onChange={e => setConfigParams({...configParams, greetingMessage: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none h-24 resize-none"
                    placeholder="Mensagem padrão enviada ao iniciar o chat..."
                  ></textarea>
               </div>
             </>
          )}

          {slug === 'map-analytics' && (
             <>
               <label className="flex items-center gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl cursor-pointer mb-4">
                  <input 
                    type="checkbox" 
                    checked={configParams.trackViews || false} 
                    onChange={e => setConfigParams({...configParams, trackViews: e.target.checked})}
                    className="w-5 h-5 accent-orange-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Monitorar visualizações dos turistas</span>
                  </div>
               </label>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Precisão do Heatmap</label>
                  <select 
                    value={configParams.heatmapPrecision || ''}
                    onChange={e => setConfigParams({...configParams, heatmapPrecision: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="low">Baixa (Menos consumo de dados, agrega grandes áreas)</option>
                    <option value="high">Alta (Precisa, em tempo real, maior consumo)</option>
                  </select>
               </div>
             </>
          )}

           <div className="pt-6 border-t border-slate-100 flex justify-end">
             <button 
               onClick={handleSave}
               disabled={loadingSave}
               className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2 active:scale-95 disabled:opacity-70 shadow-md"
             >
               {loadingSave ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white"></div>
               ) : (
                  <Save size={18} />
               )}
               Salvar Configurações
             </button>
           </div>

        </div>
      </div>
    </div>
  );
}
