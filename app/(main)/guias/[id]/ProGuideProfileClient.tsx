"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

export default function ProGuideProfileClient({ guide }: { guide: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("roteiros");
  const [isFavorite, setIsFavorite] = useState(false);

  const name = guide.user?.name || "Guia Local";
  const bio = guide.bio || "Guia especialista certificado.";
  const totalReviews = Math.floor((guide.user?.id?.length || 0) % 40) + 10;
  const rating = typeof guide.rating === "number" ? guide.rating.toFixed(1) : (guide.rating || "5.0");
  const profileImage = guide.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=f59e0b&color=fff`;

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(isFavorite ? "Removido dos favoritos" : "❤️ Guia adicionado aos favoritos");
  };

  const openWhatsApp = () => {
    showToast('💬 Abrindo WhatsApp para conversar...');
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); }
        .dark .glass-card { background: rgba(30, 41, 59, 0.7); border-color: rgba(255,255,255,0.08); }
        .pro-gradient { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .tab-button { padding: 10px 20px; font-weight: 500; font-size: 14px; border-radius: 40px; transition: all 0.2s; cursor: pointer; }
        .tab-button.active { background: #f97316; color: white; }
        .feed-scroll::-webkit-scrollbar { width: 4px; }
        .feed-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .pro-badge { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 40px; display: inline-flex; align-items: center; box-shadow: 0 4px 10px rgba(245,158,11,0.3); }
        .verified-badge { background: #22c55e; color: white; font-size: 10px; padding: 2px 8px; border-radius: 40px; font-weight: 600; }
      `}} />

      <div className="max-w-md mx-auto relative h-[calc(100vh-60px)] md:h-screen flex flex-col shadow-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="relative shrink-0">
          <div className="h-48 bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-yellow-900/30 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-30">🚗🌷🌟</div>
            <button onClick={() => router.back()} className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:bg-white dark:hover:bg-slate-700 transition">
              <i className="fas fa-arrow-left text-slate-700 dark:text-slate-200"></i>
            </button>
            <button onClick={() => showToast('📤 Perfil compartilhado')} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:bg-white dark:hover:bg-slate-700 transition">
              <i className="fas fa-share-alt text-slate-700 dark:text-slate-200"></i>
            </button>
            <div className="absolute bottom-4 right-4 pro-badge z-10">
              <i className="fas fa-crown mr-1"></i> PRO
            </div>
          </div>
          <div className="absolute -bottom-8 left-5 z-20">
            <div className="h-20 w-20 rounded-2xl pro-gradient p-0.5 shadow-xl relative">
              <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                <Image src={profileImage} alt={name} fill className="object-cover" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full h-7 w-7 flex items-center justify-center shadow-md text-xs z-30">
              <i className="fas fa-check"></i>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto feed-scroll px-5 pt-10 pb-20 relative z-10">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h1>
                <span className="pro-badge"><i className="fas fa-crown mr-1"></i> PRO</span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <i className="fas fa-map-pin text-amber-500 text-xs"></i>
                <button onClick={() => showToast('🗺️ Abrir página de Holambra')} className="hover:text-orange-500 transition">Holambra</button>,
                <button onClick={() => showToast('🗺️ Abrir página de SP')} className="hover:text-orange-500 transition">SP</button>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition" onClick={toggleFavorite}>
                <i className={`${isFavorite ? 'fas text-rose-500' : 'far text-slate-700 dark:text-slate-300'} fa-heart text-xl`}></i>
              </button>
              <button className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 transition text-white flex items-center justify-center shadow-md" onClick={openWhatsApp}>
                <i className="fab fa-whatsapp text-xl"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 mb-4 flex-wrap">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <i className="fas fa-star text-amber-400 mr-1"></i> {rating} ({totalReviews} tours)
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <i className="fas fa-suitcase-rolling text-orange-500 mr-1"></i> {guide.totalKm || 860}+ km
            </span>
            <span className="verified-badge"><i className="fas fa-check-circle mr-1"></i> Verificado</span>
          </div>
          
          <div className="mb-5">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{bio}</p>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-900 dark:text-white"><i className="fas fa-shield-alt text-amber-500"></i> Segurança e Documentação</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-500 dark:text-slate-400">📄 CADASTUR</span><p className="font-medium text-slate-900 dark:text-white">Registrado</p></div>
              <div><span className="text-xs text-slate-500 dark:text-slate-400">🪪 Identidade</span><p className="verified-badge w-fit mt-1">Verificado</p></div>
              <div><span className="text-xs text-slate-500 dark:text-slate-400">🚗 Doc. Veículo</span><p className="verified-badge w-fit mt-1">Verificado</p></div>
              <div><span className="text-xs text-slate-500 dark:text-slate-400">👤 Reconhecimento</span><p className="verified-badge w-fit mt-1">Realizado</p></div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-900 dark:text-white"><i className="fas fa-car text-amber-500"></i> Veículo</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-500 dark:text-slate-400">Modelo</span><p className="font-medium text-slate-900 dark:text-white">Toyota Corolla 2024</p></div>
              <div><span className="text-xs text-slate-500 dark:text-slate-400">Placa</span><p className="font-medium text-slate-900 dark:text-white">ABC-1234</p></div>
              <div><span className="text-xs text-slate-500 dark:text-slate-400">Cor</span><p className="font-medium text-slate-900 dark:text-white">Prata</p></div>
              <div><span className="text-xs text-slate-500 dark:text-slate-400">Capacidade</span><p className="font-medium text-slate-900 dark:text-white">4 passageiros</p></div>
              <div className="col-span-2"><span className="text-xs text-slate-500 dark:text-slate-400">📸 Foto do veículo</span>
                <div className="mt-1 h-20 w-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl shadow-inner">🚗</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95" onClick={() => showToast('📅 Agendamento online')}>
              <i className="fas fa-calendar-plus"></i> Agendar Tour
            </button>
            <button className="w-14 h-14 shrink-0 rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all active:scale-95" onClick={() => showToast('💬 Chat com o guia')}>
              <i className="fas fa-comments text-xl"></i>
            </button>
            <button className="w-14 h-14 shrink-0 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/20 transition-all active:scale-95" onClick={openWhatsApp}>
              <i className="fab fa-whatsapp text-xl"></i>
            </button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 text-slate-600 dark:text-slate-300">
            <button className={`tab-button whitespace-nowrap ${activeTab === 'roteiros' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('roteiros')}>🗺️ Roteiros ({guide.routes?.length || 5})</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'pacotes' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('pacotes')}>📦 Pacotes ({guide.packages?.length || 3})</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'avaliacoes' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('avaliacoes')}>⭐ Avaliações</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'galeria' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('galeria')}>📷 Galeria</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'videos' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('videos')}>🎬 Vídeos</button>
          </div>

          {activeTab === 'roteiros' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3 mb-6">
                <div className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🌷 Tour das Flores</h4>
                      <p className="text-xs text-slate-500">3h • 8 km • Fácil</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Visita aos principais campos de flores e jardins temáticos.</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Ativo</span>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🏛️ Rota dos Moinhos</h4>
                      <p className="text-xs text-slate-500">4h • 12 km • Moderado</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Ativo</span>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🍽️ Tour Gastronômico</h4>
                      <p className="text-xs text-slate-500">5h • 10 km • Fácil</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Ativo</span>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🚴 Tour de Bike</h4>
                      <p className="text-xs text-slate-500">4h • 15 km • Moderado</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Ativo</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center font-medium">Roteiros ilimitados · PRO</p>
            </div>
          )}

          {activeTab === 'pacotes' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3 mb-6">
                <div className="glass-card rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🌸 Tour Completo Holambra</h4>
                      <p className="text-xs text-slate-500">6h • Inclui almoço • Grupos até 4</p>
                    </div>
                    <span className="bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold">Destaque</span>
                  </div>
                  <p className="font-black text-amber-600 dark:text-amber-500 mt-2 text-lg">R$ 250 <span className="text-xs text-slate-500 font-medium">/ pessoa</span></p>
                </div>
                <div className="glass-card rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🌙 Experiência Noturna</h4>
                      <p className="text-xs text-slate-500">3h • Jantar incluso • Casais</p>
                    </div>
                    <span className="bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold">Destaque</span>
                  </div>
                  <p className="font-black text-amber-600 dark:text-amber-500 mt-2 text-lg">R$ 180 <span className="text-xs text-slate-500 font-medium">/ pessoa</span></p>
                </div>
                <div className="glass-card rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">📸 Tour Fotográfico</h4>
                      <p className="text-xs text-slate-500">4h • Guia + fotógrafo • Até 6 pessoas</p>
                    </div>
                    <span className="bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold">Destaque</span>
                  </div>
                  <p className="font-black text-amber-600 dark:text-amber-500 mt-2 text-lg">R$ 320 <span className="text-xs text-slate-500 font-medium">/ pessoa</span></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'avaliacoes' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3 mb-6">
                <p className="text-sm text-slate-500 text-center py-8">Nenhuma avaliação recente encontrada para este guia.</p>
              </div>
            </div>
          )}

          {activeTab === 'galeria' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl shadow-inner">🌷</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-3xl shadow-inner">🏛️</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center text-3xl shadow-inner">🍽️</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-3xl shadow-inner">🚗</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center text-3xl shadow-inner">🌸</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-200 to-indigo-300 flex items-center justify-center text-3xl shadow-inner">🌅</div>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-3 mb-6">
                <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">🎬</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">Tour das Flores · Destaques</p>
                    <p className="text-xs text-slate-500 mt-0.5">2:34 min</p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600 transition ml-2" onClick={() => showToast('▶️ Reproduzindo vídeo...')}>
                    <i className="fas fa-play-circle text-3xl"></i>
                  </button>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">🎬</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">Depoimento de Clientes</p>
                    <p className="text-xs text-slate-500 mt-0.5">1:45 min</p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600 transition ml-2" onClick={() => showToast('▶️ Reproduzindo vídeo...')}>
                    <i className="fas fa-play-circle text-3xl"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
