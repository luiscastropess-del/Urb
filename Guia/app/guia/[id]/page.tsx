'use client';

import React, { useState, useEffect } from 'react';
import { getPublicGuideProfile } from '@/app/actions.guide.public';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PublicGuideProfilePro } from '@/components/PublicGuideProfilePro';
import { PublicGuideProfileUltimate } from '@/components/PublicGuideProfileUltimate';

export default function PublicGuideProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('roteiros');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await getPublicGuideProfile(id);
      if (res.error) {
        setToastMsg(res.error);
      } else {
        setData(res);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const toggleFavorite = () => {
    showToast('❤️ Em breve: Guia adicionado aos favoritos!');
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>;
  }

  if (!data?.profile) {
    return <div className="p-8 text-center text-red-500">Perfil não encontrado.</div>;
  }

  const { profile, activePlan } = data;
  const isFree = activePlan === 'free';
  const name = profile.user?.name || "Guia Parceiro";
  const avatarText = name.substring(0, 1).toUpperCase();

  if (activePlan === 'ultimate') {
    return <PublicGuideProfileUltimate profile={profile} activePlan={activePlan} />;
  }

  if (!isFree) {
    return <PublicGuideProfilePro profile={profile} activePlan={activePlan} />;
  }
  
  return (
    <div className="antialiased text-slate-800 dark:text-slate-200">
      <div className="max-w-md mx-auto relative h-screen flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Header com capa e avatar */}
        <div className="relative">
          {/* Imagem de capa */}
          <div className="h-48 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🚗🌷</div>
            {/* Botão voltar */}
            <button onClick={() => router.back()} className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md">
              <i className="fas fa-arrow-left text-slate-700 dark:text-slate-200"></i>
            </button>
            {/* Botão compartilhar */}
            <button onClick={() => showToast('📤 Perfil compartilhado')} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md">
              <i className="fas fa-share-alt text-slate-700 dark:text-slate-200"></i>
            </button>
            {/* Selo do plano */}
            {isFree && (
              <div className="absolute bottom-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 shadow-sm">
                <i className="fas fa-leaf mr-1 text-green-500"></i> Plano Free
              </div>
            )}
            {!isFree && (
              <div className="absolute bottom-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-md">
                <i className="fas fa-crown mr-1"></i> {activePlan.toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Avatar sobreposto */}
          <div className="absolute -bottom-8 left-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 p-0.5 shadow-xl">
              <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-4xl overflow-hidden">
                 {profile.user?.avatar ? (
                   <img src={profile.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="font-bold text-slate-400 text-3xl">{avatarText}</span>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Área com scroll */}
        <div className="flex-1 overflow-y-auto px-5 pt-10 pb-20 no-scrollbar">
          
          {/* Nome, localização e ações principais */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{name}</h1>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wide">Guia Local</span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <i className="fas fa-map-pin text-blue-500 text-xs"></i>
                <button onClick={() => showToast('Em breve: Mapa da cidade')} className="hover:text-orange-500 transition">Holambra</button>,
                <span className="hover:text-orange-500 transition cursor-pointer">SP</span>
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform hover:scale-105" onClick={toggleFavorite}>
                <i className="far fa-heart text-xl text-slate-500 dark:text-slate-400"></i>
              </button>
              <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform hover:scale-105" onClick={() => showToast('💬 Abrir chat')}>
                <i className="far fa-comment-dots text-xl text-slate-500 dark:text-slate-400"></i>
              </button>
            </div>
          </div>

          {/* Estatísticas rápidas e verificação */}
          <div className="flex items-center gap-2 mt-3 mb-4 flex-wrap">
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium">
              <i className="fas fa-star text-amber-400 mr-1"></i> {profile.rating ? profile.rating.toFixed(1) : 'Novo'}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium">
              <i className="fas fa-suitcase-rolling text-orange-500 mr-1"></i> {profile.packages?.length || 0} Pacotes
            </span>
            <span className="bg-green-500 text-white text-[10px] uppercase px-2.5 py-1 rounded-full font-bold shadow-sm">
              <i className="fas fa-check-circle mr-1"></i> Verificado
            </span>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
            {profile.bio || "Olá! Sou um guia local apaixonado por mostrar os melhores cantinhos da nossa região."}
          </div>

          {/* Verificações e badges de segurança */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 mb-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><i className="fas fa-shield-alt text-blue-500"></i> Segurança e Verificações</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">📄 CADASTUR</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">12.345-6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🪪 Doc. Identidade</span>
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold"><i className="fas fa-check"></i> Verificado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🚗 Doc. Veículo</span>
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded uppercase font-bold"><i className="fas fa-check"></i> Verificado</span>
              </div>
            </div>
          </div>

          {/* Ações: Agendamento e Chat */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" onClick={() => showToast('📅 Agendamento aberto')}>
              <i className="fas fa-calendar-plus"></i> Agendar
            </button>
            <button className="flex-1 py-3.5 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" onClick={() => showToast(`💬 Conversar com ${name}`)}>
              <i className="fas fa-comments"></i> Conversar
            </button>
          </div>

          {/* Abas de conteúdo */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'roteiros', icon: '🗺️', label: 'Roteiros' },
              { id: 'pacotes', icon: '📦', label: 'Pacotes' },
              { id: 'avaliacoes', icon: '⭐', label: 'Avaliações' },
              { id: 'galeria', icon: '📷', label: 'Galeria' },
            ].map(tab => (
              <button 
                key={tab.id}
                className={`shrink-0 px-4 py-2 text-sm font-bold rounded-full transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          <div className="min-h-[200px]">
            {activeTab === 'roteiros' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                {(!profile.routes || profile.routes.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-6">Nenhum roteiro público disponível no momento.</p>
                ) : (
                  profile.routes.map((r: any) => (
                    <div key={r.id} className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">{r.durationMinutes || 120} min • Moderado</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{r.description || 'Um roteiro incrível pela região.'}</p>
                        </div>
                        <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] uppercase font-bold px-2 py-1 rounded-md shrink-0">Ativo</span>
                      </div>
                    </div>
                  ))
                )}
                {isFree && (
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-wide font-bold mt-4">Limite do plano gratuito: 2 roteiros</p>
                )}
              </div>
            )}

            {activeTab === 'pacotes' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                {(!profile.packages || profile.packages.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-6">Nenhum pacote publicado no momento.</p>
                ) : (
                  profile.packages.map((p: any) => (
                    <div key={p.id} className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="pr-4">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{p.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {p.durationDays}d • Grupos {p.minPeople} a {p.maxPeople}
                          </p>
                        </div>
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-1 rounded-md shrink-0">Destaque</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                         <p className="font-black text-orange-600 text-lg">R$ {p.price?.toFixed(2)}</p>
                         <button className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Detalhes</button>
                      </div>
                    </div>
                  ))
                )}
                {isFree && (
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-wide font-bold mt-4">Limite do plano free: 2 pacotes</p>
                )}
              </div>
            )}

            {activeTab === 'avaliacoes' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold shrink-0">C</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">Carlos S.</span>
                        <span className="text-amber-400 text-[10px] flex gap-0.5">
                          <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">&quot;O melhor guia da cidade. Super atencioso e conhece detalhes que nem os moradores locais sabem.&quot;</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-2 uppercase">Há 3 dias</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'galeria' && (
              <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-3xl shadow-inner">🌷</div>
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-3xl shadow-inner">🏛️</div>
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-3xl shadow-inner">🍽️</div>
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-3xl shadow-inner">🚗</div>
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-3xl shadow-inner">🌸</div>
              </div>
            )}
          </div>

          {/* Upgrade para plano Pro (call to action visualizado pelo guia e pelos turistas) */}
          {isFree && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-5 mt-8 mb-4 border border-orange-200 dark:border-orange-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fas fa-crown text-6xl text-amber-500"></i>
              </div>
              <div className="relative z-10">
                <h3 className="font-black text-sm flex items-center gap-2 text-slate-800 dark:text-slate-200"><i className="fas fa-crown text-amber-500"></i> Acesso Limitado (Free)</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-medium">Este guia utiliza o perfil básico. Ao fazer Upgrade para Premium, descobre-se roteiros ilimitados, fotos e agendamento instantâneo.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast flutuante global */}
      {toastMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4">
          ✨ {toastMsg}
        </div>
      )}
    </div>
  );
}
