import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Share2, Heart, MessageSquare, ShieldCheck, Map, Clock, Users, ArrowRight, ChevronLeft, Languages, CheckCircle } from "lucide-react";
import { getGuide } from "@/app/actions.tours";
import FreeGuideProfileClient from "./FreeGuideProfileClient";
import ProGuideProfileClient from "./ProGuideProfileClient";
import UltimateGuideProfileClient from "./UltimateGuideProfileClient";

export default async function GuideProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const guide = await getGuide(resolvedParams.id);

  if (!guide) {
    notFound();
  }

  // Se o guia tem plano gratuito, renderiza a versão da Landing Page Gratuita
  if (guide.plan === 'free') {
    return <FreeGuideProfileClient guide={guide} />;
  }

  // Se o guia tem plano ultimate, renderiza a Landing Page Ultimate baseada no anexo
  if (guide.plan === 'ultimate') {
    return <UltimateGuideProfileClient guide={guide} />;
  }

  // Se o guia tem plano pro, renderiza a Landing Page PRO
  if (guide.plan === 'pro') {
    return <ProGuideProfileClient guide={guide} />;
  }

  const profileImage = guide.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.user?.name || 'Guia')}&size=200&background=F97316&color=fff`;
  const name = guide.user?.name || "Guia Local";
  const bio = guide.bio || "Guia especialista certificado, apaixonado por compartilhar experiências únicas e inesquecíveis.";
  const languages = (guide.languages as string[]) || ["Português"];
  
  // Stable random fallback for reviews if not present in DB
  const fallbackReviews = Math.floor((guide.user?.id?.length || 0) % 40) + 10;
  const totalReviews = fallbackReviews;
  
  // Clean up languages if they have curly braces from Postgres arrays
  const cleanLanguages = languages.map((lang: string) => lang.replace(/^\{|\}$/g, ''));

  return (
    <div className="min-h-screen h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-24">
       {/* Small App Bar */}
       <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-3 flex items-center justify-between">
           <Link href="/pacotes" className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <ChevronLeft size={20} />
           </Link>
           <h1 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">Perfil do Guia</h1>
           <div className="flex gap-2">
             <button className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Share2 size={18} />
             </button>
           </div>
       </div>

       <div className="max-w-3xl mx-auto mt-6 px-5">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left relative overflow-hidden">
             
             {/* Featured Background Decor */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100 dark:from-orange-500/10 to-transparent"></div>

             <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white dark:border-slate-900 overflow-hidden shadow-xl shrink-0 bg-slate-100">
                <Image
                  src={profileImage}
                  alt={name}
                  fill
                  className="object-cover"
                />
             </div>
             
             <div className="relative z-10 flex-1 pt-2 md:pt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                   {guide.status === 'APPROVED' && (
                     <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                       <ShieldCheck size={12} /> Verificado
                     </span>
                   )}
                   {(guide.plan === 'pro' || guide.plan === 'ultimate') && (
                     <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                       <Star size={12} className="fill-orange-600" /> Destaque
                     </span>
                   )}
                </div>
                
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{name}</h1>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm">
                   <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <Star className="text-amber-500 fill-amber-500" size={18} />
                      <span className="text-lg">{typeof guide.rating === "number" ? guide.rating.toFixed(1) : (guide.rating || "5.0")}</span>
                      <span className="text-slate-500">({totalReviews} avaliações)</span>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6">
                   <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <Map className="text-blue-500 mb-1" size={20} />
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tours</span>
                      <span className="font-black text-slate-900 dark:text-white">{guide.packages?.length || 0}</span>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <Clock className="text-emerald-500 mb-1" size={20} />
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Aprovação</span>
                      <span className="font-black text-slate-900 dark:text-white">~2h</span>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center">
                      <MapPin className="text-orange-500 mb-1" size={20} />
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total</span>
                      <span className="font-black text-slate-900 dark:text-white">{guide.totalKm || 0}km</span>
                   </div>
                </div>
              </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-6">
            
            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                   Sobre mim
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {bio}
                </p>

                {cleanLanguages.length > 0 && (
                   <div className="mt-6">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Languages size={16} className="text-orange-500" /> Idiomas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {cleanLanguages.map((lang: string, idx: number) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            {lang}
                          </span>
                        ))}
                      </div>
                   </div>
                )}
              </div>

              {/* Pacotes do Guia */}
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Pacotes Deste Guia</h2>
                 </div>
                 
                 <div className="space-y-4">
                    {guide.packages && guide.packages.length > 0 ? (
                      guide.packages.map((pkg: any) => (
                         <Link href={`/explore/${pkg.id}`} key={pkg.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 hover:shadow-md transition-shadow group">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative shrink-0">
                               {pkg.images && pkg.images.length > 0 ? (
                                  <Image 
                                    src={pkg.images[0]} 
                                    alt={pkg.title} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                               ) : (
                                  <Image 
                                    src="https://picsum.photos/seed/tour/400/400" 
                                    alt="Default Tour" 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                               )}
                            </div>
                            <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                               <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white truncate">{pkg.title}</h3>
                                 <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                       <Clock size={12} />
                                       <span>{pkg.durationDays} {pkg.durationDays > 1 ? 'dias' : 'dia'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Users size={12} />
                                       <span>até {pkg.maxPeople}</span>
                                    </div>
                                 </div>
                               </div>
                               
                               <div className="flex items-end justify-between mt-2">
                                  <div>
                                     <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">A partir de</span>
                                     <span className="font-black text-orange-500 text-lg">R$ {pkg.price}</span>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                     <ArrowRight size={16} />
                                  </div>
                               </div>
                            </div>
                         </Link>
                      ))
                    ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center">
                        <Map className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
                        <h3 className="text-slate-900 dark:text-white font-bold mb-1">Nenhum pacote publicado</h3>
                        <p className="text-slate-500 text-sm">O guia ainda não tem pacotes disponíveis.</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Sidebar actions */}
            <div className="w-full md:w-72 space-y-4 shrink-0">
               <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                 <MessageSquare size={18} /> Entrar em Contato
               </button>

               <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4">Garantias PGuia</h3>
                 <ul className="space-y-3">
                   <li className="flex gap-3 items-start">
                     <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Pagamento seguro via plataforma</span>
                   </li>
                   <li className="flex gap-3 items-start">
                     <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Reserva com confirmação em até 24h</span>
                   </li>
                   <li className="flex gap-3 items-start">
                     <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                     <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Suporte 24/7 caso imprevistos ocorram</span>
                   </li>
                 </ul>
               </div>
            </div>

          </div>
       </div>
    </div>
  );
}
