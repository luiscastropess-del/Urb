"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Shield, Heart, MessageCircle, Star, Briefcase, Car, Calendar, Crown, MapPin, PlayCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function GuideProfileClient({ profile, isFree, isUltimate, planName }: { profile: any, isFree: boolean, isUltimate?: boolean, planName: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("roteiros");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFaq, setShowFaq] = useState<Record<number, boolean>>({});

  const meta = (() => {
    try {
      return JSON.parse(profile.metadata || "{}");
    } catch {
      return {};
    }
  })();

  const isPro = !isFree;

  const toggleFaq = (index: number) => setShowFaq(prev => ({ ...prev, [index]: !prev[index] }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <div className="max-w-md mx-auto relative min-h-screen flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Header com capa e avatar */}
        <div className="relative">
          {/* Imagem de capa */}
          <div className={`h-48 relative overflow-hidden ${isUltimate ? "bg-gradient-to-br from-violet-200 via-fuchsia-200 to-amber-200 dark:from-violet-900/30 dark:via-fuchsia-900/20 dark:to-amber-900/30" : isPro ? "bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40" : "bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30"}`}>
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🚗🌷</div>
            {/* Botão voltar */}
            <button onClick={() => router.back()} className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:scale-105 transition">
              <ArrowLeft className="text-slate-700 dark:text-slate-200 h-5 w-5" />
            </button>
            {/* Botão compartilhar */}
            <button onClick={() => showToast('📤 Perfil compartilhado')} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10 hover:scale-105 transition">
              <Share2 className="text-slate-700 dark:text-slate-200 h-5 w-5" />
            </button>
            {/* Selo PRO/Free/Ultimate */}
            <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold shadow-md z-10 flex items-center gap-1 ${isUltimate ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500 text-white shadow-purple-500/40" : isPro ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200"}`}>
              <Crown className={`w-3 h-3 ${isFree ? "text-amber-500" : "fill-white"}`} /> {isUltimate ? "ULTIMATE" : isPro ? "PRO" : planName}
            </div>
          </div>
          
          {/* Avatar sobreposto */}
          <div className="absolute -bottom-8 left-5 z-20">
            <div className={`h-20 w-20 rounded-2xl p-0.5 shadow-xl relative ${isUltimate ? "bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500" : isPro ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-sky-400 to-indigo-500"}`}>
              <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-4xl overflow-hidden">
                {profile.user?.avatar ? (
                  <img src={profile.user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  "🧑‍🏫"
                )}
              </div>
              {isPro && (
                <div className={`absolute -top-1 -right-1 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-md ${isUltimate ? "bg-purple-600" : "bg-amber-500"}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área com scroll */}
        <div className="flex-1 overflow-y-auto px-5 pt-12 pb-10 scrollbar-hide">
          
          {/* Nome, localização e ações principais */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.user?.name || "Guia Local"}</h1>
                {!isPro && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Guia Local</span>}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 font-medium">
                <MapPin className="text-amber-500 h-3 w-3" />
                <span className="hover:text-amber-500 transition cursor-pointer" onClick={() => showToast('🗺️ Abrir página da cidade')}>Holambra</span>,
                <span className="hover:text-amber-500 transition cursor-pointer" onClick={() => showToast('🗺️ Abrir página do estado')}>SP</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition hover:scale-105" 
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  showToast(isFavorite ? 'Removido dos favoritos' : '❤️ Guia adicionado aos favoritos');
                }}
              >
                <Heart className={`h-5 w-5 transition-colors ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-600 dark:text-slate-400"}`} />
              </button>
              {isPro && (
                <button className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition hover:scale-105" onClick={() => showToast('💬 Abrir WhatsApp')}>
                   <MessageCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">
            {profile.bio || "Olá! Sou guia em Holambra e estou pronto para te levar aos melhores passeios da região."}
          </div>

          {/* Estatísticas rápidas e verificação */}
          <div className="flex items-center gap-2 mt-4 mb-5 flex-wrap">
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center font-medium">
              <Star className="text-amber-400 w-3 h-3 mr-1 fill-amber-400" /> {profile.rating || "4.9"} (86)
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center font-medium">
              <Briefcase className="text-orange-500 w-3 h-3 mr-1" /> {profile.totalKm ? `${profile.totalKm} km` : "860+ viagens"}
            </span>
            {isPro && (
              <span className="bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Docs Verificados
              </span>
            )}
          </div>

          {/* Verificações e badges de segurança */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Shield className={`${isPro ? "text-amber-500" : "text-blue-500"} w-4 h-4`} /> 
              Segurança e Documentação
            </h3>
            <div className={`grid ${isPro ? "grid-cols-2" : "grid-cols-1"} gap-4 text-sm`}>
              <div>
                <span className="text-xs text-slate-500 font-medium">📄 CADASTUR</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{meta.cadastur || "12.345-6"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">🪪 Documentação</span>
                <div className="mt-1">
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Verificado</span>
                </div>
              </div>
              {isPro && (
                <>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">🚗 Doc. Veículo</span>
                    <div className="mt-1">
                       <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Verificado</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">👤 Reconhecimento</span>
                    <div className="mt-1">
                       <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Realizado</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Informações do veículo */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 mb-5 backdrop-blur-sm">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Car className={`${isPro ? "text-amber-500" : "text-blue-500"} w-4 h-4`} /> 
              Veículo
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-xs text-slate-500 font-medium">Modelo</span><p className="font-semibold mt-0.5">{meta.vehicleModel || "Toyota Corolla"}</p></div>
              <div><span className="text-xs text-slate-500 font-medium">Capacidade</span><p className="font-semibold mt-0.5">{meta.vehicleCapacity || 4} pass.</p></div>
              {isPro && (
                 <>
                   <div><span className="text-xs text-slate-500 font-medium">Placa</span><p className="font-semibold mt-0.5">{meta.vehiclePlate || "ABC-1234"}</p></div>
                   <div><span className="text-xs text-slate-500 font-medium">Cor</span><p className="font-semibold mt-0.5">{meta.vehicleColor || "Prata"}</p></div>
                   <div className="col-span-2">
                     <span className="text-xs text-slate-500 font-medium">📸 Foto do veículo</span>
                     <div className="mt-2 h-24 w-full rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-4xl shadow-inner border border-slate-100 dark:border-slate-700">🚗</div>
                   </div>
                 </>
              )}
            </div>
          </div>

          {/* Ações: Agendamento e Chat */}
          <div className="flex gap-3 mb-6">
            <button className={`flex-1 py-3.5 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition ${isUltimate ? "bg-gradient-to-tr from-orange-500 to-green-500" : isPro ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-gradient-to-r from-indigo-500 to-blue-500"}`} onClick={() => showToast('📅 Agendamento aberto')}>
              <Calendar className="w-5 h-5" /> Agendar Tour
            </button>
            <button className={`w-14 h-14 rounded-xl text-white flex items-center justify-center shadow-md hover:opacity-90 transition ${isUltimate ? "bg-purple-600" : isPro ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"}`} onClick={() => showToast('💬 Abrindo chat')}>
              <MessageCircle className={`w-5 h-5 ${!isPro ? "text-slate-700 dark:text-slate-200" : ""}`} />
            </button>
            {isPro && (
              <button className="w-14 h-14 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-600 transition" onClick={() => showToast('📞 Abrindo WhatsApp')}>
                <MessageCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Abas */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            <button onClick={() => setActiveTab('roteiros')} className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap transition shadow-sm ${activeTab === 'roteiros' ? (isUltimate ? "bg-purple-600 text-white" : isPro ? "bg-orange-500 text-white" : "bg-blue-600 text-white") : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>🗺️ Roteiros</button>
            <button onClick={() => setActiveTab('pacotes')} className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap transition shadow-sm ${activeTab === 'pacotes' ? (isUltimate ? "bg-purple-600 text-white" : isPro ? "bg-orange-500 text-white" : "bg-blue-600 text-white") : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>📦 Pacotes</button>
            <button onClick={() => setActiveTab('avaliacoes')} className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap transition shadow-sm ${activeTab === 'avaliacoes' ? (isUltimate ? "bg-purple-600 text-white" : isPro ? "bg-orange-500 text-white" : "bg-blue-600 text-white") : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>⭐ Avaliações</button>
            <button onClick={() => setActiveTab('galeria')} className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap transition shadow-sm ${activeTab === 'galeria' ? (isUltimate ? "bg-purple-600 text-white" : isPro ? "bg-orange-500 text-white" : "bg-blue-600 text-white") : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>📷 Galeria</button>
            {isPro && (
               <button onClick={() => setActiveTab('videos')} className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap transition shadow-sm ${activeTab === 'videos' ? (isUltimate ? "bg-purple-600 text-white" : "bg-orange-500 text-white") : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>🎬 Vídeos</button>
            )}
            {isUltimate && (
               <button onClick={() => setActiveTab('faq')} className={`px-4 py-2 font-semibold text-sm rounded-full whitespace-nowrap transition shadow-sm ${activeTab === 'faq' ? "bg-purple-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>❓ FAQ</button>
            )}
          </div>

          {/* Conteúdo Aba Roteiros */}
          {activeTab === 'roteiros' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
              {profile.routes?.length > 0 ? profile.routes.slice(0, isFree ? 2 : undefined).map((route: any) => (
                <div key={route.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{route.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{route.durationMinutes ? `${route.durationMinutes} min` : "Diversas durações"} • Diversas Dificuldades</p>
                      {route.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{route.description}</p>}
                    </div>
                    {isPro && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Ativo</span>}
                  </div>
                </div>
              )) : (
                <>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">🌷 Tour das Flores</h4>
                        <p className="text-xs text-slate-500 mt-1">3h • 8 km • Fácil</p>
                        <p className="text-xs text-slate-500 mt-1">Visita aos principais campos de flores e jardins temáticos.</p>
                      </div>
                      {isPro && <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-1 rounded-full font-bold">Ativo</span>}
                    </div>
                  </div>
                  {isPro && (
                     <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-bold">🏛️ Rota dos Moinhos</h4>
                           <p className="text-xs text-slate-500 mt-1">4h • 12 km • Moderado</p>
                           <p className="text-xs text-slate-500 mt-1">Conheça os moinhos históricos e a cultura holandesa.</p>
                         </div>
                         <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-1 rounded-full font-bold">Ativo</span>
                       </div>
                     </div>
                  )}
                </>
              )}
              <p className="text-xs text-slate-400 text-center mt-4">
                 {isFree ? "Limite do plano gratuito: 2 roteiros" : "Roteiros ilimitados · PRO"}
              </p>
            </div>
          )}

          {/* Conteúdo Aba Pacotes */}
          {activeTab === 'pacotes' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
              {profile.packages?.length > 0 ? profile.packages.slice(0, isFree ? 1 : undefined).map((pkg: any) => (
                <div key={pkg.id} className={`rounded-xl p-4 shadow-sm hover:shadow-md transition border ${isPro ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{pkg.title}</h4>
                      <p className="text-xs text-slate-500">{pkg.durationDays} dia(s) • Grupos até {pkg.maxPeople}</p>
                    </div>
                    {isPro && <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Destaque</span>}
                  </div>
                  <p className={`font-bold mt-3 ${isPro ? "text-amber-600 dark:text-amber-500" : "text-blue-600 dark:text-blue-400"}`}>R$ {pkg.price} / pessoa</p>
                </div>
              )) : (
                <div className={`rounded-xl p-4 shadow-sm border ${isPro ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">🌸 Tour Completo Holambra</h4>
                      <p className="text-xs text-slate-500">6h • Inclui almoço • Grupos até 4</p>
                    </div>
                    {isPro && <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Destaque</span>}
                  </div>
                  <p className={`font-bold mt-3 ${isPro ? "text-amber-600 dark:text-amber-500" : "text-blue-600 dark:text-blue-400"}`}>R$ 250 / pessoa</p>
                </div>
              )}
              <p className="text-xs text-slate-400 text-center mt-4">
                 {isFree ? "Limite do plano gratuito: 1 pacote em destaque" : "Pacotes em destaque ilimitados · PRO"}
              </p>
            </div>
          )}

          {/* Conteúdo Aba Avaliações */}
          {activeTab === 'avaliacoes' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
               <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">J</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">João Silva</span>
                        <div className="flex text-amber-400"><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/></div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">&quot;Guia incrível! Conhece cada cantinho de Holambra.&quot;</p>
                      <p className="text-[10px] text-slate-400 mt-2">Há 3 dias</p>
                    </div>
                  </div>
               </div>
               {isPro && (
                 <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">M</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">Maria Alves</span>
                          <div className="flex text-amber-400"><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/><Star className="fill-amber-400 w-3 h-3"/><Star className="w-3 h-3"/></div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">&quot;Passeio maravilhoso, carro confortável e muitas histórias interessantes.&quot;</p>
                        <p className="text-[10px] text-slate-400 mt-2">Há 1 semana</p>
                      </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Conteúdo Aba Galeria */}
          {activeTab === 'galeria' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center text-3xl shadow-sm">🌷</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-3xl shadow-sm">🏛️</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl shadow-sm">🍽️</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-3xl shadow-sm">🚗</div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center text-3xl shadow-sm">🌸</div>
                {isPro && (
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-200 to-indigo-300 flex items-center justify-center text-3xl shadow-sm">🌅</div>
                )}
              </div>
            </div>
          )}

          {/* Conteúdo Aba Vídeos */}
          {activeTab === 'videos' && isPro && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl shrink-0 relative overflow-hidden group">
                  🎬
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                     <PlayCircle className="text-white w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Tour das Flores · Destaques</p>
                  <p className="text-xs text-slate-500 mt-1">2:34 min</p>
                </div>
                <button className="text-blue-500 hover:text-blue-600 transition" onClick={() => showToast('▶️ Reproduzindo vídeo...')}>
                  <PlayCircle className="w-8 h-8" />
                </button>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="h-16 w-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl shrink-0 relative overflow-hidden group">
                  🎬
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                     <PlayCircle className="text-white w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Depoimento de Clientes</p>
                  <p className="text-xs text-slate-500 mt-1">1:45 min</p>
                </div>
                <button className="text-blue-500 hover:text-blue-600 transition" onClick={() => showToast('▶️ Reproduzindo vídeo...')}>
                  <PlayCircle className="w-8 h-8" />
                </button>
              </div>
            </div>
          )}

          {/* Conteúdo Aba FAQ */}
          {activeTab === 'faq' && isUltimate && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
              {[
                { q: "Qual a duração dos tours?", a: "Os tours variam de 2h a 6h dependendo do roteiro escolhido. Consulte cada roteiro para detalhes específicos." },
                { q: "Posso personalizar o roteiro?", a: "Sim! No plano Ultimate oferecemos roteiros totalmente personalizados de acordo com suas preferências." },
                { q: "Os passeios incluem alimentação?", a: "Alguns pacotes incluem alimentação. Verifique na descrição de cada pacote o que está incluso." }
              ].map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 shadow-sm transition">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleFaq(i)}>
                    <span className="font-medium text-sm">{faq.q}</span>
                    <button className="text-purple-500">
                      <svg className={`w-4 h-4 transition-transform ${showFaq[i] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  {showFaq[i] && (
                    <p className="text-xs text-slate-500 mt-2 animate-in fade-in slide-in-from-top-1">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upgrade ULTIMATE (call to action) */}
          {isUltimate && (
            <div className="rounded-2xl p-4 mt-6 mb-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border border-purple-200 dark:border-purple-800 shadow-inner">
              <h3 className="font-bold text-sm flex items-center gap-2"><Crown className="w-4 h-4 text-purple-500 fill-purple-500" /> Você está visualizando o plano Ultimate</h3>
              <p className="text-xs text-slate-500 mt-1">Este guia possui visibilidade máxima, roteiros ilimitados e recursos exclusivos.</p>
              <button className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full text-sm font-medium shadow-md shadow-purple-500/20 hover:opacity-90 transition" onClick={() => showToast('👑 Plano Ultimate ativo')}>
                Máximo desempenho
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
