"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

export default function FreeGuideProfileClient({ guide }: { guide: any }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("roteiros");
  const [isFavorite, setIsFavorite] = useState(false);

  const name = guide.user?.name || "Guia Local";
  const bio = guide.bio || "Guia especialista certificado.";
  // Random reviews logic
  const totalReviews = Math.floor((guide.user?.id?.length || 0) % 40) + 10;
  const rating = typeof guide.rating === "number" ? guide.rating.toFixed(1) : (guide.rating || "5.0");
  const profileImage = guide.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=0ea5e9&color=fff`;

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      showToast("❤️ Guia adicionado aos favoritos");
    } else {
      showToast("Removido dos favoritos");
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .dark .glass-card {
          background: rgba(30, 41, 59, 0.7);
          border-color: rgba(255,255,255,0.08);
        }
        .guide-gradient {
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
        }
        .tab-button {
          padding: 8px 16px;
          font-weight: 500;
          font-size: 14px;
          border-radius: 40px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .tab-button.active {
          background: #f97316;
          color: white;
        }
        .feed-scroll::-webkit-scrollbar { width: 4px; }
        .feed-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .plan-badge {
          background: #e2e8f0;
          color: #475569;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 40px;
        }
        .dark .plan-badge { background: #334155; color: #cbd5e1; }
        .verified-badge {
          background: #22c55e;
          color: white;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 40px;
          font-weight: 600;
        }
      `}} />

      <div className="max-w-md mx-auto relative h-[calc(100vh-60px)] md:h-screen flex flex-col shadow-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Header com capa e avatar */}
        <div className="relative shrink-0">
          {/* Imagem de capa */}
          <div className="h-48 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🚗🌷</div>
            {/* Botão voltar */}
            <button onClick={() => router.back()} className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:bg-white dark:hover:bg-slate-700 transition">
              <i className="fas fa-arrow-left text-slate-700 dark:text-slate-200"></i>
            </button>
            {/* Botão compartilhar */}
            <button onClick={() => showToast('📤 Perfil compartilhado')} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:bg-white dark:hover:bg-slate-700 transition">
              <i className="fas fa-share-alt text-slate-700 dark:text-slate-200"></i>
            </button>
            {/* Selo do plano */}
            <div className="absolute bottom-4 right-4 plan-badge bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <i className="fas fa-leaf mr-1"></i> Plano Free
            </div>
          </div>
          
          {/* Avatar sobreposto */}
          <div className="absolute -bottom-8 left-5 z-20">
            <div className="h-20 w-20 rounded-2xl guide-gradient p-0.5 shadow-xl relative">
              <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                <Image src={profileImage} alt={name} fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Área com scroll */}
        <div className="flex-1 overflow-y-auto feed-scroll px-5 pt-10 pb-20 relative z-10">
          
          {/* Nome, localização e ações principais */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h1>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">Guia Local</span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <i className="fas fa-map-pin text-blue-500 text-xs"></i>
                <button onClick={() => showToast('🗺️ Abrir página de Holambra')} className="hover:text-orange-500 transition">Holambra</button>,
                <button onClick={() => showToast('🗺️ Abrir página de SP')} className="hover:text-orange-500 transition">SP</button>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition" onClick={toggleFavorite}>
                <i className={`${isFavorite ? 'fas text-rose-500' : 'far text-slate-700 dark:text-slate-300'} fa-heart text-xl`}></i>
              </button>
              <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300" onClick={() => showToast('💬 Abrir chat')}>
                <i className="far fa-comment-dots text-xl"></i>
              </button>
            </div>
          </div>

          {/* Estatísticas rápidas e verificação */}
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
            <p className="text-sm text-slate-600 dark:text-slate-300">{bio}</p>
          </div>

          {/* Verificações e badges de segurança */}
          <div className="glass-card rounded-2xl p-4 mb-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-900 dark:text-white"><i className="fas fa-shield-alt text-blue-500"></i> Segurança e Verificações</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">📄 CADASTUR</span>
                <span className="font-medium text-slate-900 dark:text-white">Registrado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🪪 Documento de identidade</span>
                <span className="verified-badge"><i className="fas fa-check"></i> Verificado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">👤 Reconhecimento de perfil</span>
                <span className="verified-badge"><i className="fas fa-check"></i> Realizado</span>
              </div>
            </div>
          </div>

          {/* Ações: Agendamento e Chat */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all active:scale-95" onClick={() => showToast('📅 Agendamento aberto')}>
              <i className="fas fa-calendar-plus"></i> Agendar
            </button>
            <button className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95" onClick={() => showToast(`💬 Conversar com ${name.split(' ')[0]}`)}>
              <i className="fas fa-comments"></i> Conversar
            </button>
          </div>

          {/* Abas de conteúdo */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 text-slate-600 dark:text-slate-300">
            <button className={`tab-button whitespace-nowrap ${activeTab === 'roteiros' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('roteiros')}>🗺️ Roteiros</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'pacotes' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('pacotes')}>📦 Pacotes</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'avaliacoes' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('avaliacoes')}>⭐ Avaliações</button>
            <button className={`tab-button whitespace-nowrap ${activeTab === 'galeria' ? 'active text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`} onClick={() => setActiveTab('galeria')}>📷 Galeria</button>
          </div>

          {/* Conteúdo das abas */}
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
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Conheça os moinhos históricos e a cultura holandesa.</p>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Ativo</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center font-medium">Limite do plano gratuito: 2 roteiros</p>
            </div>
          )}

          {activeTab === 'pacotes' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {guide.packages && guide.packages.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {guide.packages.slice(0, 1).map((pkg: any) => (
                    <div key={pkg.id} className="glass-card rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{pkg.title}</h4>
                          <p className="text-xs text-slate-500">{pkg.durationDays}d • Grupos até {pkg.maxPeople}</p>
                        </div>
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Destaque</span>
                      </div>
                      <p className="font-black text-orange-600 dark:text-orange-500 mt-2 text-lg">R$ {pkg.price} <span className="text-xs text-slate-500 font-medium">/ pessoa</span></p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">🌸 Tour Completo Holambra</h4>
                      <p className="text-xs text-slate-500">6h • Inclui almoço • Grupos até 4</p>
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Destaque</span>
                  </div>
                  <p className="font-black text-orange-600 dark:text-orange-500 mt-2 text-lg">R$ 250 <span className="text-xs text-slate-500 font-medium">/ pessoa</span></p>
                </div>
              )}
              <p className="text-xs text-slate-400 text-center font-medium">Limite do plano gratuito: 1 pacote em destaque</p>
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
                <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center text-3xl shadow-inner">🌷</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-3xl shadow-inner">🏛️</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl shadow-inner">🍽️</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-3xl shadow-inner">🚗</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center text-3xl shadow-inner">🌸</div>
              </div>
            </div>
          )}

          {/* Upgrade para plano Pro (call to action) */}
          <div className="glass-card rounded-2xl p-5 mt-6 mb-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
            <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white"><i className="fas fa-crown text-amber-500"></i> Quer mais visibilidade?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">Faça upgrade para o plano Pro e desbloqueie roteiros ilimitados, pacotes em destaque, contato direto via WhatsApp e muito mais.</p>
            <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95" onClick={() => showToast('⬆️ Acessando planos Pro...')}>
              Upgrade para Pro
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
