"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Edit, Moon, Bell, MapPin, Crown, Eye, MousePointer, Phone, Star, ArrowUp, Minus, Trophy, ChartLine, Users, Clock, BarChart, Camera, Tag, Megaphone, Gem } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPlace, deletePlace } from "@/app/actions";
import { Place } from "@prisma/client";

export default function PlaceAdminPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [place, setPlace] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isReimporting, setIsReimporting] = useState(false);

  useEffect(() => {
    if (id) {
      getPlace(id).then(data => {
        if (data) setPlace(data);
      });
    }
  }, [id]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  const handleReimport = async () => {
    if (!place?.googlePlaceId) {
      showToast("⚠️ Este local não possui vínculo (ID) com o Google Places para ser sincronizado.");
      return;
    }
    setIsReimporting(true);
    showToast("🔄 Sincronizando dados com o Google...");
    try {
      const res = await fetch('/api/admin/reimport-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: place.id })
      });
      const data = await res.json();
      if (data.error) {
        showToast(`❌ Erro: ${data.error}`);
      } else {
        showToast(`✅ ${data.message}`);
        // Reload place data
        const updated = await getPlace(id);
        if(updated) setPlace(updated);
      }
    } catch(err) {
      showToast("❌ Erro ao sincronizar dados");
    } finally {
      setIsReimporting(false);
    }
  };

  if (!place) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative w-full border-l border-r border-slate-200 dark:border-slate-800">
      
      {/* Header Premium */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 flex shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <ArrowLeft className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center shadow-lg text-2xl overflow-hidden relative ${place.premium ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border border-yellow-300' : 'bg-gradient-to-br from-orange-400 to-green-500'}`}>
                {place.coverImage ? (
                  <img src={place.coverImage} className="w-full h-full object-cover absolute inset-0" />
                ) : place.emoji}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold leading-tight truncate max-w-[140px]">{place.name}</h1>
                  {place.premium && (
                    <span className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Crown size={10} /> PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin size={12} className="text-orange-500" />
                  <span>Holambra, SP</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleDarkMode} className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Moon className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
          </div>
        </div>
        
        {/* Seletor de período */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 shadow-sm font-medium">Hoje</span>
            <span className="px-3 py-1.5 text-slate-500">Semana</span>
            <span className="px-3 py-1.5 text-slate-500">Mês</span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> 17 Abr 2026</span>
        </div>
      </header>

      {/* Main Content with scroll */}
      <div className="flex-1 overflow-y-auto feed-scroll px-5 pb-24 relative">
        
        {/* Abas de navegação */}
        <div className="flex gap-6 mt-2 mb-4 border-b border-slate-200 dark:border-slate-700 text-sm font-medium overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`pb-3 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'overview' ? 'text-orange-500 border-orange-500' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`pb-3 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'analytics' ? 'text-orange-500 border-orange-500' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('marketing')} 
            className={`pb-3 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'marketing' ? 'text-orange-500 border-orange-500' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Marketing
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`pb-3 whitespace-nowrap border-b-2 transition-colors ${activeTab === 'settings' ? 'text-orange-500 border-orange-500' : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Ajustes
          </button>
        </div>

        {/* ABA: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Métricas principais */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Eye size={12} /> <span>Visualizações hoje</span>
                </div>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1"><ArrowUp size={12} /> 23% vs ontem</p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <MousePointer size={12} /> <span>Cliques no site</span>
                </div>
                <p className="text-2xl font-bold">87</p>
                <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1"><ArrowUp size={12} /> 12%</p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Phone size={12} /> <span>Ligações</span>
                </div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-amber-600 flex items-center gap-1 font-medium mt-1"><Minus size={12} /> estável</p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Star size={12} /> <span>Avaliação</span>
                </div>
                <p className="text-2xl font-bold">{place.rating}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1"><ArrowUp size={12} /> +0.2</p>
              </div>
            </div>

            {/* Destaque (Se premium) */}
            {place.premium && (
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-yellow-100" />
                  <h3 className="font-bold">Destaque Premium Ativo</h3>
                </div>
                <p className="text-sm text-yellow-50 mb-4">Seu estabelecimento aparece nas primeiras posições de busca e destaque na Home.</p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg"><ChartLine size={12} /> Top 10%</span>
                  <span className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg"><Users size={12} /> +342 views</span>
                </div>
              </div>
            )}

            {/* Gráfico Simulado */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><BarChart size={16} className="text-orange-500" /> Desempenho (7d)</h3>
              <div className="flex items-end justify-between h-20 gap-2">
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[30%]"></div><span className="text-[10px] text-slate-400">S</span></div>
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[45%]"></div><span className="text-[10px] text-slate-400">T</span></div>
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[28%]"></div><span className="text-[10px] text-slate-400">Q</span></div>
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[60%]"></div><span className="text-[10px] text-slate-400">Q</span></div>
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[52%]"></div><span className="text-[10px] text-slate-400">S</span></div>
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[80%]"></div><span className="text-[10px] text-slate-400">S</span></div>
                <div className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-[4px] h-[55%]"></div><span className="text-[10px] text-slate-400">D</span></div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-3 gap-2">
              <button className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-xl p-3 text-center transition hover:scale-[1.02]" onClick={() => showToast('📸 Adicionar foto em destaque')}>
                <Camera className="text-amber-500 mx-auto mb-1.5" size={20} />
                <p className="text-[10px] sm:text-xs font-semibold">Foto destaque</p>
              </button>
              <button className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-xl p-3 text-center transition hover:scale-[1.02]" onClick={() => showToast('🎯 Criar promoção')}>
                <Tag className="text-amber-500 mx-auto mb-1.5" size={20} />
                <p className="text-[10px] sm:text-xs font-semibold">Promoção</p>
              </button>
              <button className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-xl p-3 text-center transition hover:scale-[1.02]" onClick={() => showToast('📢 Impulsionar anúncio')}>
                <Megaphone className="text-amber-500 mx-auto mb-1.5" size={20} />
                <p className="text-[10px] sm:text-xs font-semibold">Impulsionar</p>
              </button>
            </div>
          </div>
        )}

        {/* ABA: ANALYTICS (Mock) */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4">📈 Origem do tráfego</h3>
              <div className="space-y-3">
                <div><div className="flex justify-between text-xs mb-1 font-medium"><span>Busca no app</span><span>45%</span></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{width: '45%'}}></div></div></div>
                <div><div className="flex justify-between text-xs mb-1 font-medium"><span>Mapa</span><span>30%</span></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width: '30%'}}></div></div></div>
                <div><div className="flex justify-between text-xs mb-1 font-medium"><span>Links</span><span>15%</span></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{width: '15%'}}></div></div></div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: AJUSTES */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3">⚙️ Informações Registradas</h3>
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500">Nome</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{place.name}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500">Categoria</span>
                  <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{place.type}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500">Distância/Local</span>
                  <span className="font-medium">{place.distance}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500">Avaliações</span>
                  <span className="font-medium">{place.reviews} total</span>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/admin/edit/${place.id}`)}
                className="w-full mt-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Editar Informações
              </button>
              {place.googlePlaceId && (
                <button 
                  onClick={handleReimport}
                  disabled={isReimporting}
                  className="w-full mt-2 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2"
                >
                  {isReimporting ? <span className="animate-pulse">Sincronizando...</span> : "Enriquecer dados via Google API"}
                </button>
              )}
            </div>
            
            {place.premium && (
              <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-sm mb-3">💎 Assinatura Exclusiva</h3>
                <div className="p-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700/30 rounded-xl">
                  <div className="flex justify-between items-center"><span className="font-bold text-yellow-800 dark:text-yellow-500">Plano Anual</span><span className="font-bold text-yellow-800 dark:text-yellow-500">Ativo</span></div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-600 mt-1">Acesso a todas as estatísticas e destaque.</p>
                </div>
              </div>
            )}

            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3 text-rose-600 dark:text-rose-400">🚨 Zona de Perigo</h3>
              <p className="text-xs text-rose-500 mb-4">Ao excluir este local, todos os dados, avaliações e configurações serão removidos permanentemente.</p>
              <button 
                onClick={async () => {
                  if (confirm('Tem certeza que deseja excluir este local? Essa ação não pode ser desfeita.')) {
                    await deletePlace(place.id);
                    showToast('🗑️ Local excluído!');
                    router.push('/admin');
                  }
                }}
                className="w-full py-2.5 bg-rose-500 text-white rounded-xl font-medium text-sm hover:bg-rose-600 transition"
              >
                Excluir Local
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg ${place.premium ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {place.emoji}
            </div>
            <div className="truncate">
              <p className="text-xs text-slate-500 truncate cursor-default">Gerenciando</p>
              <p className="text-sm font-bold truncate overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
                {place.name}
              </p>
            </div>
          </div>
          <button onClick={() => router.push(`/place/${id}`)} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 shrink-0 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
             <Eye size={16} /> <span className="hidden sm:inline">Visualizar</span> Cliente
          </button>
        </div>
      </div>
      
    </div>
  );
}
