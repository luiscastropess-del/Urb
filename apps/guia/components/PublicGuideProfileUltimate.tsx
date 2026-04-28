import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PublicGuideProfileUltimate({ profile, activePlan }: { profile: any, activePlan: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('roteiros');
  const [toastMsg, setToastMsg] = useState('');

  const name = profile.user?.name || "Marcelo Guia";
  const avatarText = name.substring(0, 1).toUpperCase();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    const icon = e.currentTarget.querySelector('i');
    if (icon?.classList.contains('far')) {
      icon.className = 'fas fa-heart text-rose-500 text-xl';
      showToast('❤️ Guia adicionado aos favoritos');
    } else if (icon) {
      icon.className = 'far fa-heart text-xl';
      showToast('Removido dos favoritos');
    }
  };

  const openWhatsApp = () => {
    showToast('💬 Abrindo WhatsApp para conversar...');
  };

  const toggleFaq = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const answer = btn.parentElement?.parentElement?.querySelector('.faq-answer');
    const icon = btn.querySelector('i');
    if (answer && icon) {
      if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        icon.className = 'fas fa-chevron-up text-xs';
      } else {
        answer.classList.add('hidden');
        icon.className = 'fas fa-chevron-down text-xs';
      }
    }
  };

  const customColor = profile.customColors || '#f97316';
  const customFont = profile.customFont || "'Inter', sans-serif";
  const customSettingsStr = profile.customSettings || "{}";
  let customSettings: any = {};
  try {
    customSettings = JSON.parse(customSettingsStr);
  } catch(e) {}
  const themeStyle = customSettings.themeStyle || "modern";
  const showWhatsapp = customSettings.showWhatsapp !== false;

  return (
    <div className="antialiased text-slate-800 dark:text-slate-200" style={{ fontFamily: customFont }}>
      <div className="max-w-md mx-auto relative h-screen flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden" style={{ transition: 'background 0.2s', ...((themeStyle === 'elegant') && { borderRadius: '24px' }), ...((themeStyle === 'minimal') && { borderRadius: '4px' }) }}>
        
        {/* Header */}
        <div className="relative shrink-0">
          {/* Cover Image */}
          <div className="h-48 relative overflow-hidden" style={{ backgroundColor: customColor, opacity: 0.85 }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30 mix-blend-overlay">🚗🌷🌟👑</div>
            <button onClick={() => router.back()} className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md">
              <i className="fas fa-arrow-left text-slate-700 dark:text-slate-200"></i>
            </button>
            <button onClick={() => showToast('📤 Perfil compartilhado')} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md">
              <i className="fas fa-share-alt text-slate-700 dark:text-slate-200"></i>
            </button>
            <div className="absolute bottom-4 right-4 text-white text-[11px] font-semibold px-3 py-1 flex items-center shadow-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1, #d946ef)', borderRadius: themeStyle === 'modern' ? '9999px' : (themeStyle === 'minimal' ? '4px' : '12px') }}>
              <i className="fas fa-crown mr-1 text-yellow-300"></i> ULTIMATE
            </div>
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-8 left-5">
            <div className="h-20 w-20 p-0.5 shadow-xl" style={{ backgroundColor: customColor, borderRadius: themeStyle === 'modern' ? '1rem' : (themeStyle === 'minimal' ? '0.25rem' : '50%') }}>
              <div className="h-full w-full bg-white dark:bg-slate-800 flex items-center justify-center text-4xl overflow-hidden" style={{ borderRadius: themeStyle === 'modern' ? 'calc(1rem - 2px)' : (themeStyle === 'minimal' ? 'calc(0.25rem - 2px)' : '50%') }}>
                {profile.user?.avatar ? (
                   <img src={profile.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="font-bold text-slate-400 text-3xl">{avatarText}</span>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 pt-10 pb-20 no-scrollbar">
          
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{name}</h1>
                <span className="text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center shadow-lg" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1, #d946ef)' }}>
                  <i className="fas fa-crown mr-1 text-yellow-300"></i> ULTIMATE
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <i className="fas fa-map-pin text-purple-500 text-xs"></i>
                <button onClick={() => showToast('🗺️ Abrir página de Holambra')} className="hover:text-orange-500 transition font-medium">Holambra</button>,
                <button onClick={() => showToast('🗺️ Abrir página de SP')} className="hover:text-orange-500 transition font-medium">SP</button>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition" onClick={toggleFavorite}>
                <i className="far fa-heart text-xl"></i>
              </button>
              <button className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md transition" onClick={openWhatsApp}>
                <i className="fab fa-whatsapp text-xl"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 mb-4 flex-wrap">
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <i className="fas fa-star text-amber-400 mr-1"></i> {profile.rating ? profile.rating.toFixed(1) : '4.9'} ({profile.routes?.length || 86} tours)
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <i className="fas fa-suitcase-rolling text-purple-500 mr-1"></i> {profile.packages?.length || 860}+ viagens
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <i className="fas fa-route text-blue-500 mr-1"></i> 12.340 km
            </span>
            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold inline-flex items-center">
              <i className="fas fa-check-circle mr-1"></i> Verificado
            </span>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
            {profile.bio || "Olá! Sou um guia local apaixonado por mostrar os melhores cantinhos da nossa região."}
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 mb-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><i className="fas fa-shield-alt text-purple-500"></i> Segurança e Documentação</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-500">📄 CADASTUR</span><p className="font-medium">12.345-6</p></div>
              <div><span className="text-xs text-slate-500">🪪 Identidade</span><p className="bg-green-500 text-white inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold">Verificado</p></div>
              <div><span className="text-xs text-slate-500">🚗 Doc. Veículo</span><p className="bg-green-500 text-white inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold">Verificado</p></div>
              <div><span className="text-xs text-slate-500">👤 Reconhecimento</span><p className="bg-green-500 text-white inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold">Realizado</p></div>
              <div><span className="text-xs text-slate-500">🛡️ Seguro Turismo</span><p className="bg-green-500 text-white inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold">Vigente</p></div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-4 mb-5 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><i className="fas fa-car text-purple-500"></i> Veículo e Equipamentos</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-xs text-slate-500">Modelo</span><p className="font-medium">Toyota Corolla 2024</p></div>
              <div><span className="text-xs text-slate-500">Placa</span><p className="font-medium">ABC-1234</p></div>
              <div><span className="text-xs text-slate-500">Cor</span><p className="font-medium">Prata</p></div>
              <div><span className="text-xs text-slate-500">Capacidade</span><p className="font-medium">4 passageiros</p></div>
              <div className="col-span-2"><span className="text-xs text-slate-500">📸 Foto do veículo</span>
                <div className="mt-1 h-20 w-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl">🚗</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-5 shrink-0">
            <button className="flex-1 py-3.5 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #f97316 0%, #22c55e 100%)' }} onClick={() => showToast('📅 Agendamento online')}>
              <i className="fas fa-calendar-plus"></i> Agendar Tour
            </button>
            <button className="w-14 h-14 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md transition hover:bg-purple-700" onClick={() => showToast('💬 Chat com o guia')}>
              <i className="fas fa-comments text-xl"></i>
            </button>
            <button className="w-14 h-14 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md transition hover:bg-green-600" onClick={openWhatsApp}>
              <i className="fab fa-whatsapp text-xl"></i>
            </button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'roteiros', label: '🗺️ Roteiros' },
              { id: 'pacotes', label: '📦 Pacotes' },
              { id: 'avaliacoes', label: '⭐ Avaliações' },
              { id: 'galeria', label: '📷 Galeria' },
              { id: 'videos', label: '🎬 Vídeos' },
              { id: 'faq', label: '❓ FAQ' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
             {activeTab === 'roteiros' && (
              <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                {(!profile.routes || profile.routes.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-6">Nenhum roteiro disponível.</p>
                ) : (
                  profile.routes.map((r: any, index: number) => (
                    <div key={r.id} className={`bg-white/70 dark:bg-slate-800/70 border rounded-xl p-4 shadow-sm ${index === 0 ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border-purple-200 dark:border-purple-800' : 'border-slate-200 dark:border-slate-700'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{r.durationMinutes || 120} min • Moderado</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description || 'Um roteiro incrível pela região.'}</p>
                        </div>
                        {index === 0 ? (
                           <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full font-bold shrink-0">Premium</span>
                        ) : (
                           <span className="bg-green-100 dark:bg-green-900/30 text-green-700 text-xs px-2 py-1 rounded-full font-medium shrink-0">Ativo</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <p className="text-xs text-slate-400 text-center uppercase tracking-wide mt-4">Roteiros ilimitados · ULTIMATE</p>
              </div>
            )}

            {activeTab === 'pacotes' && (
              <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                {(!profile.packages || profile.packages.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-6">Nenhum pacote publicado.</p>
                ) : (
                  profile.packages.map((p: any, index: number) => (
                    <div key={p.id} className={`border rounded-xl p-4 shadow-sm ${index === 0 ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'}`}>
                      <div className="flex justify-between items-start">
                        <div className="pr-4">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{p.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{p.durationDays}d • Grupos até {p.maxPeople}</p>
                        </div>
                        {index === 0 ? (
                           <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full font-bold">Premium</span>
                        ) : (
                           <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded-full font-bold">Destaque</span>
                        )}
                      </div>
                      <p className={`font-bold mt-2 ${index === 0 ? 'text-purple-600' : 'text-amber-600'}`}>R$ {p.price?.toFixed(2)} / pessoa</p>
                    </div>
                  ))
                )}
                <p className="text-xs text-slate-400 text-center mt-4">Pacotes em destaque ilimitados · ULTIMATE</p>
              </div>
            )}

            {activeTab === 'avaliacoes' && (
               <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                   <div className="flex items-start gap-2">
                     <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">J</div>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="font-medium text-sm">João</span>
                         <span className="text-amber-400 text-xs"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i></span>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">&quot;Guia incrível! Conhece cada cantinho de Holambra. Recomendo para todos!&quot;</p>
                       <p className="text-[10px] text-slate-400 mt-1">Há 3 dias</p>
                     </div>
                   </div>
                 </div>
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                   <div className="flex items-start gap-2">
                     <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">M</div>
                     <div className="flex-1">
                       <div className="flex items-center justify-between">
                         <span className="font-medium text-sm">Maria</span>
                         <span className="text-amber-400 text-xs"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="far fa-star"></i></span>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">&quot;Passeio maravilhoso, carro confortável e muitas histórias interessantes.&quot;</p>
                       <p className="text-[10px] text-slate-400 mt-1">Há 1 semana</p>
                     </div>
                   </div>
                 </div>
               </div>
            )}

            {activeTab === 'galeria' && (
               <div className="grid grid-cols-3 gap-2 mb-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-2xl">🌷</div>
                 <div className="aspect-square rounded-xl bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-2xl">🏛️</div>
                 <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center text-2xl">🍽️</div>
                 <div className="aspect-square rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-2xl">🚗</div>
                 <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center text-2xl">🌸</div>
                 <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-200 to-indigo-300 flex items-center justify-center text-2xl">🌅</div>
               </div>
            )}

            {activeTab === 'videos' && (
               <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                   <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl">🎬</div>
                   <div>
                     <p className="font-medium text-sm">Tour das Flores · Destaques</p>
                     <p className="text-xs text-slate-500">2:34 min</p>
                   </div>
                   <button className="ml-auto text-purple-500 transition hover:scale-110" onClick={() => showToast('▶️ Reproduzindo vídeo...')}><i className="fas fa-play-circle text-2xl"></i></button>
                 </div>
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                   <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl">🎬</div>
                   <div>
                     <p className="font-medium text-sm">Depoimento de Clientes</p>
                     <p className="text-xs text-slate-500">1:45 min</p>
                   </div>
                   <button className="ml-auto text-purple-500 transition hover:scale-110" onClick={() => showToast('▶️ Reproduzindo vídeo...')}><i className="fas fa-play-circle text-2xl"></i></button>
                 </div>
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                   <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl">🎬</div>
                   <div>
                     <p className="font-medium text-sm">Tour 360° · Holambra Virtual</p>
                     <p className="text-xs text-slate-500">4:12 min</p>
                   </div>
                   <button className="ml-auto text-purple-500 transition hover:scale-110" onClick={() => showToast('▶️ Reproduzindo tour 360°...')}><i className="fas fa-play-circle text-2xl"></i></button>
                 </div>
               </div>
            )}

            {activeTab === 'faq' && (
               <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">Qual a duração dos tours?</span>
                     <button onClick={toggleFaq} className="text-purple-500"><i className="fas fa-chevron-down text-xs"></i></button>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 hidden faq-answer">Os tours variam de 2h a 6h dependendo do roteiro escolhido. Consulte cada roteiro para detalhes específicos.</p>
                 </div>
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">Posso personalizar o roteiro?</span>
                     <button onClick={toggleFaq} className="text-purple-500"><i className="fas fa-chevron-down text-xs"></i></button>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 hidden faq-answer">Sim! No plano Ultimate oferecemos roteiros totalmente personalizados de acordo com suas preferências.</p>
                 </div>
                 <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-sm">Os passeios incluem alimentação?</span>
                     <button onClick={toggleFaq} className="text-purple-500"><i className="fas fa-chevron-down text-xs"></i></button>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 hidden faq-answer">Alguns pacotes incluem alimentação. Verifique na descrição de cada pacote o que está incluso.</p>
                 </div>
               </div>
            )}
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-4 mt-6 mb-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border border-purple-200 dark:border-purple-800">
            <h3 className="font-bold text-sm flex items-center gap-2"><i className="fas fa-crown text-purple-500"></i> Você está visualizando o plano Ultimate</h3>
            <p className="text-xs text-slate-500 mt-1">Este guia possui visibilidade máxima, roteiros ilimitados e recursos exclusivos.</p>
            <button className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full text-sm font-medium" onClick={() => showToast('👑 Plano Ultimate ativo')}>
              Máximo desempenho
            </button>
          </div>

        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm font-medium shadow-xl z-50 animate-in fade-in slide-in-from-bottom-4">
          ✨ {toastMsg}
        </div>
      )}
    </div>
  );
}
