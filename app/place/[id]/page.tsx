"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, MapPin, Star, Share2, Heart, Clock, Phone, Globe, Instagram, CheckCircle2, ChevronRight, MessageCircle, Image as ImageIcon, Utensils, Trophy, Wifi, CreditCard, Car, ThumbsUp, ChevronDown, CalendarPlus, Crown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPlace } from "@/app/actions";
import { Place, Photo, Review, OpeningHours } from "@prisma/client";

type CompletePlace = Place & {
  photos?: Photo[];
  googleReviews?: Review[];
  openingHours?: OpeningHours | null;
};

export default function PlacePublicPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [place, setPlace] = useState<CompletePlace | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      getPlace(id).then(data => {
        if (data) {
           setPlace(data);
           // Check favorite status if session exists
           import('@/app/actions').then(({ getFavorites }) => {
              getFavorites().then(favs => {
                  if(favs.find((f: any) => f.placeId === data.id)) setIsFavorite(true);
              });
           });
        }
      });
    }
  }, [id]);

  const toggleFav = async () => {
    try {
      const { toggleFavorite } = await import('@/app/actions');
      const res = await toggleFavorite({ placeId: place!.id });
      if (res.status === 'added') {
         setIsFavorite(true);
         showToast('❤️ Adicionado aos favoritos!');
      } else {
         setIsFavorite(false);
         showToast('💔 Removido dos favoritos!');
      }
    } catch (e: any) {
      showToast('⚠️ Entre para favoritar locais');
      router.push('/login');
    }
  };

  const handleCheckIn = async () => {
    try {
      const { createCheckIn } = await import('@/app/actions');
      await createCheckIn(place!.id);
      showToast('✅ Check-in realizado! +15 XP');
    } catch (err: any) {
      if (err.message.includes('not logged') || err.message === 'Auth required') {
        showToast('⚠️ Faça login para fazer check-in');
        router.push('/login');
      } else {
        showToast('❌ Erro ao fazer check-in');
      }
    }
  };

  if (!place) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900"><div className="animate-pulse flex items-center justify-center h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div></div>;
  }

  let images: string[] = [];
  if (place.photos && place.photos.length > 0) {
    images = place.photos.map(p => p.url);
  } else if (place.images) {
    try {
      images = JSON.parse(place.images);
    } catch {}
  }

  const glassCard = "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-white/10";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative w-full border-x border-slate-200 dark:border-slate-800">
      
      {/* Header com imagem de capa e ações */}
      <div className="relative shrink-0">
        {/* Imagem de capa */}
        <div className="h-56 bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40 relative overflow-hidden">
          {place.coverImage ? (
            <img src={place.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">{place.emoji}</div>
          )}
          {/* Badge Premium flutuante */}
          {place.premium && (
            <div className="absolute top-4 left-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center shadow-lg uppercase tracking-wide">
              <Crown size={12} className="mr-1 fill-white" /> PREMIUM
            </div>
          )}
          {/* Botão voltar */}
          <button onClick={() => router.back()} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center shadow-md">
            <ArrowLeft size={18} className="text-slate-700 dark:text-slate-200" />
          </button>
          {/* Galeria de fotos (indicador) */}
          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1.5 rounded-full flex items-center tracking-wide">
            <ImageIcon size={12} className="mr-1.5" /> {images.length > 0 ? `1/${images.length}` : '1/1'}
          </div>
        </div>
        
        {/* Avatar/logotipo sobreposto */}
        <div className="absolute -bottom-8 left-5 z-10">
          <div className={`h-20 w-20 rounded-2xl ${place.premium ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700' : 'bg-gradient-to-br from-orange-400 to-green-500'} p-0.5 shadow-xl`}>
            <div className="h-full w-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center text-4xl overflow-hidden relative">
              {place.profileImage ? (
                <img src={place.profileImage} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                place.emoji
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área com scroll */}
      <div className="flex-1 overflow-y-auto feed-scroll px-5 pt-12 pb-24">
        
        {/* Nome, categoria e ações principais */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-black">{place.name}</h1>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-wide uppercase">
                <CheckCircle2 size={12} className="text-amber-500" /> Verificado
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Star size={12} className="fill-amber-400 text-amber-400" /> {place.rating?.toFixed(1) || '0.0'} ({place.userRatingsTotal || place.reviews || 0} avaliações)
              <span className="mx-1 text-slate-300 dark:text-slate-600">•</span> 
              <span>{place.type}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button className={`h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform hover:scale-105 ${isFavorite ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`} onClick={toggleFav}>
              <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
            </button>
            <button className="h-10 w-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-transform hover:scale-105" onClick={() => showToast('🔗 Copiado!')}>
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Destaque Premium: posição #1 e selo */}
        {place.premium && (
          <div className="mt-3 mb-5 p-3 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 rounded-2xl text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <Trophy size={20} className="text-yellow-200" />
              <div>
                <p className="font-bold text-sm leading-tight">Destaque Premium</p>
                <p className="text-[10px] text-white/90 uppercase tracking-wide font-medium mt-0.5">#1 em {place.type}s em Holambra</p>
              </div>
            </div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Top 1%</span>
          </div>
        )}

        {/* Informações rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`rounded-xl p-3 flex items-center gap-3 ${glassCard}`}>
            <Clock size={16} className={place.openingHours?.openNow ? "text-green-500 shrink-0" : "text-amber-500 shrink-0"} />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase font-bold">
                {place.openingHours?.openNow ? "Aberto hoje" : "Horário"}
              </p>
              <p className="font-semibold text-[11px] leading-tight mt-0.5 truncate">
                {place.openingHours?.weekdayText?.[0]?.split(": ")[1] || "Verificar"}
              </p>
            </div>
          </div>
          {place.priceLevel !== null && place.priceLevel !== undefined && (
             <div className={`rounded-xl p-3 flex items-center gap-3 ${glassCard}`}>
               <CreditCard size={16} className="text-emerald-500 shrink-0" />
               <div className="min-w-0">
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Faixa de Preço</p>
                 <p className="font-semibold text-sm leading-tight mt-0.5 tracking-widest">{'$'.repeat(place.priceLevel)}</p>
               </div>
             </div>
          )}
          {(!place.priceLevel && place.premium) && (
            <div className={`rounded-xl p-3 flex items-center gap-3 ${glassCard}`}>
              <CreditCard size={16} className="text-orange-500 shrink-0" />
              <div className="min-w-0"><p className="text-[10px] text-slate-500 uppercase font-bold">Pagamento</p><p className="font-semibold text-sm leading-tight mt-0.5">Todos</p></div>
            </div>
          )}
          {place.premium && (
            <div className={`rounded-xl p-3 flex items-center gap-3 ${glassCard}`}>
              <Car size={16} className="text-orange-500 shrink-0" />
              <div className="min-w-0"><p className="text-[10px] text-slate-500 uppercase font-bold">Estaciona.</p><p className="font-semibold text-sm leading-tight mt-0.5">Próprio</p></div>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-2 flex items-center gap-2">🌸 Sobre o {place.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {place.description || place.editorialSummary || `Um excelente espaço para você e sua família/amigos. Aproveite o melhor de Holambra em ${place.name}, venha nos conhecer e desfrutar do nosso ambiente aconchegante e hospitaleiro.`}
          </p>
          {(place.tags || (place.types && place.types.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(place.tags ? place.tags.split(',') : place.types.slice(0, 5)).map((tag, i) => (
                <span key={i} className={`text-slate-600 dark:text-slate-300 text-[10px] px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider shadow-sm ${glassCard}`}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mapa simulado com pin */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base flex items-center gap-2"><MapPin size={16} className="text-amber-500" /> Localização</h3>
            <span className="text-xs text-orange-500 font-semibold flex items-center gap-0.5 cursor-pointer hover:underline" onClick={() => showToast('🗺️ Abrir no mapa')}>Ver no mapa <ChevronRight size={12} /></span>
          </div>
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-inner">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M30%200%20L60%2030%20L30%2060%20L0%2030%20Z%22%20fill%3D%22%23e2e8f0%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] opacity-30 dark:opacity-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 border-[3px] border-white shadow-lg flex items-center justify-center">
                  <span className="text-sm">{place.emoji}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-amber-500"></div>
              </div>
            </div>
            <div className={`absolute bottom-3 left-3 right-3 rounded-xl p-3 text-xs font-medium flex items-center shadow-lg ${glassCard}`}>
              <MapPin size={14} className="text-amber-500 mr-2 shrink-0" /> <span className="truncate">{place.address || 'Holambra, SP'}</span>
            </div>
          </div>
        </div>

        {/* Cardápio / Destaques -> Somente se Premium/Manual */}
        {place.premium && !place.googlePlaceId && (
          <div className="mb-8">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">✨ Destaques do cardápio</h3>
            <div className="flex gap-3 overflow-x-auto scroll-x pb-2 snap-x">
              {[
                { e: '🥧', n: 'Torta Holandesa', p: 'R$ 18,90' },
                { e: '☕', n: 'Café Especial', p: 'R$ 9,90' },
                { e: '🧇', n: 'Stroopwafel', p: 'R$ 12,50' },
                { e: '🥗', n: 'Salada Prima.', p: 'R$ 28,90' },
              ].map((d, i) => (
                <div key={i} className={`flex-shrink-0 w-32 rounded-xl p-3 snap-center ${glassCard}`}>
                  <div className="h-20 w-full rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl mb-3">{d.e}</div>
                  <p className="font-semibold text-sm truncate">{d.n}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{d.p}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📸 ÁREA DE GALERIA / FOTOS (Substituindo o antigo Instagram fake) */}
        {images.length > 0 && (
           <div className="mb-8">
             <div className="flex items-center justify-between mb-3">
               <h3 className="font-bold text-base flex items-center gap-2">
                 <ImageIcon size={18} className="text-violet-500" /> Galeria / Fotos 
               </h3>
               {place.instagram && (
                 <button onClick={() => showToast('📱 Abrindo Instagram')} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-wide">
                   <Instagram size={12} /> {place.instagram}
                 </button>
               )}
             </div>
             
             {/* Grid dinâmico de fotos importadas */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-xl overflow-hidden shadow-sm">
               {images.slice(0, 6).map((imgUrl, i) => (
                 <div key={i} className={`relative group cursor-pointer ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`} onClick={() => showToast('📷 Abrir imagem')}>
                   <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <ImageIcon size={20} className="text-white" />
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* Avaliações */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base flex items-center gap-2"><Star size={16} className="text-amber-400 fill-amber-400" /> Avaliações ({place.userRatingsTotal || place.reviews || 0})</h3>
            {(place.userRatingsTotal || 0) > 0 && (
              <span className="text-xs text-orange-500 font-semibold cursor-pointer hover:underline">Ver todas</span>
            )}
          </div>
          
          {/* Resumo */}
          {((place.userRatingsTotal || 0) > 0 || (place.rating || 0) > 0) ? (
            <div className={`rounded-2xl p-5 mb-4 shadow-sm ${glassCard}`}>
              <div className="flex items-center gap-6">
                <div className="text-center w-24 shrink-0">
                  <p className="text-4xl font-black">{place.rating?.toFixed(1) || '0.0'}</p>
                  <div className="flex text-amber-400 my-1.5 justify-center"><Star size={10} className="fill-amber-400"/><Star size={10} className="fill-amber-400"/><Star size={10} className="fill-amber-400"/><Star size={10} className="fill-amber-400"/><Star size={10} className="fill-amber-400 opacity-50"/></div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{place.userRatingsTotal || place.reviews || 0} avaliações</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="w-5 text-right shrink-0">5 ★</span><div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width: '82%'}}></div></div><span className="w-8 shrink-0 text-right">82%</span></div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="w-5 text-right shrink-0">4 ★</span><div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width: '14%'}}></div></div><span className="w-8 shrink-0 text-right">14%</span></div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="w-5 text-right shrink-0">3 ★</span><div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width: '3%'}}></div></div><span className="w-8 shrink-0 text-right">3%</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-xl p-6 text-center shadow-sm ${glassCard}`}>
              <Star size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhuma avaliação ainda</p>
              <p className="text-xs text-slate-500 mt-1">Seja o primeiro a compartilhar sua experiência!</p>
            </div>
          )}
          
          {/* Comentários */}
          <div className="space-y-3">
            {place.googleReviews && place.googleReviews.length > 0 ? (
              place.googleReviews.map((rev, i) => (
                <div key={rev.id || i} className={`rounded-xl p-4 shadow-sm ${glassCard}`}>
                  <div className="flex items-start gap-3">
                    {rev.authorPhotoUrl ? (
                      <img src={rev.authorPhotoUrl} className="h-8 w-8 rounded-full shrink-0 object-cover border border-slate-200 dark:border-slate-700" alt={rev.authorName} />
                    ) : (
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-amber-100 text-amber-600 dark:bg-amber-900/30`}>{rev.authorName[0]}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm truncate pr-2">{rev.authorName}</span>
                        <div className="flex text-amber-400 shrink-0">
                          {Array.from({length: 5}).map((_, j) => <Star key={j} size={10} className={j < Math.round(rev.rating || 0) ? "fill-amber-400" : "opacity-30"} />)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">&quot;{rev.text}&quot;</p>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-semibold tracking-wide">
                        <span className="uppercase">{rev.relativePublishTime || 'Avaliação do Google'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (!place.googlePlaceId && place.premium) ? (
              [
                { n: 'Mariana S.', c: 'Lugar encantador! O café é delicioso e o ambiente com flores é um charme. Perfeito para fotos.', s: 5, t: 'Há 3 dias', bg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' },
                { n: 'Paulo R.', c: 'Atendimento rápido e bolo de cenoura incrível. Poderia ter mais opções veganas.', s: 4, t: 'Há 1 semana', bg: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
              ].map((rev, i) => (
                <div key={i} className={`rounded-xl p-4 shadow-sm ${glassCard}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${rev.bg}`}>{rev.n[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{rev.n}</span>
                        <div className="flex text-amber-400">
                          {Array.from({length: 5}).map((_, j) => <Star key={j} size={10} className={j < rev.s ? "fill-amber-400" : "opacity-30"} />)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">&quot;{rev.c}&quot;</p>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-semibold tracking-wide">
                        <span className="uppercase">{rev.t}</span>
                        <button className="flex items-center gap-1 hover:text-amber-500 transition" onClick={() => showToast('👍 Útil')}>
                          <ThumbsUp size={12} /> {i === 0 ? 12 : i === 1 ? 5 : 2}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
          {((place.userRatingsTotal || 0) > 0 || (place.googleReviews && place.googleReviews.length > 0)) && (
            <button className="w-full mt-4 py-3 text-sm text-orange-500 font-bold flex items-center justify-center gap-1.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">
              Carregar mais avaliações <ChevronDown size={14} />
            </button>
          )}
        </div>

        {/* Informações de contato e links */}
        <div className="mb-6">
          <h3 className="font-bold text-base mb-3">📞 Contato</h3>
          <div className={`rounded-2xl divide-y divide-slate-200 dark:divide-slate-700/50 shadow-sm overflow-hidden ${glassCard}`}>
            {(place.phone || place.internationalPhone) && (
              <div className="object-cover relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <a href={`tel:${place.internationalPhone || place.phone}`} className="p-4 flex items-center justify-between w-full" onClick={() => showToast('📞 Ligando...')}>
                  <span className="text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-300"><Phone size={18} className="text-orange-500" /> Telefone</span>
                  <span className="text-sm font-bold text-orange-600 truncate ml-2">{place.phone || place.internationalPhone}</span>
                </a>
              </div>
            )}
            <div className="object-cover relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <a href="#" className="p-4 flex items-center justify-between w-full" onClick={() => showToast('💬 Abrindo WhatsApp...')}>
                <span className="text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-300"><MessageCircle size={18} className="text-green-500" /> WhatsApp</span>
                <span className="text-sm font-bold text-green-600">Enviar mensagem</span>
              </a>
            </div>
            {place.instagram && (
              <div className="object-cover relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <a href={`https://instagram.com/${place.instagram}`} target="_blank" className="p-4 flex items-center justify-between w-full">
                  <span className="text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-300"><Instagram size={18} className="text-pink-500" /> Instagram</span>
                  <span className="text-sm font-bold text-pink-600 truncate ml-2">@{place.instagram}</span>
                </a>
              </div>
            )}
            {place.website && (
              <div className="object-cover relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <a href={place.website} target="_blank" className="p-4 flex items-center justify-between w-full">
                  <span className="text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-300"><Globe size={18} className="text-blue-500" /> Website</span>
                  <span className="text-sm font-bold text-blue-600 truncate max-w-[150px] ml-2">{place.website.replace(/^https?:\/\//,'').replace(/\/$/,'')}</span>
                </a>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Barra inferior fixa de ação */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 max-w-md mx-auto z-20">
        <div className="flex gap-3 h-[52px]">
          <button className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95" onClick={handleCheckIn}>
            <CheckCircle2 size={18} /> Fazer Check-in
          </button>
          <button className="w-[52px] h-[52px] shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-sm border border-slate-200 dark:border-slate-700" onClick={() => showToast('📅 Reservar mesa')}>
            <CalendarPlus size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
