"use client";

import { useToast } from "@/components/ToastProvider";
import {
  ArrowLeft,
  MapPin,
  Star,
  User,
  Clock,
  Shield,
  Calendar,
  CheckCircle,
  MessageCircle,
  Wallet
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicPackage } from "@/app/actions.tours";
import { createReservation } from "@/app/actions.reservations";
import Image from "next/image";

export default function PacoteDetailsPage() {
  const { id } = useParams() as { id: string };
  const { showToast } = useToast();
  const router = useRouter();
  
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reservation State
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [resDate, setResDate] = useState("");
  const [resGuests, setResGuests] = useState(1);
  const [resNotes, setResNotes] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getPublicPackage(id).then((data) => {
      setPkg(data);
      setLoading(false);
    });
  }, [id]);

  const handleConfirmReservation = async () => {
    if (!resDate) {
      showToast("Por favor, selecione uma data.");
      return;
    }

    setCreating(true);
    try {
      await createReservation({
        packageId: id,
        date: resDate,
        guests: resGuests,
        notes: resNotes
      });
      showToast("Reserva confirmada! Redirecionando...");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (e: any) {
      showToast(e.message || "Erro ao realizar reserva.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10 h-full items-center"><Clock className="animate-spin text-orange-500" /></div>;
  }

  if (!pkg) {
    return <div className="p-8 text-center text-slate-500">Pacote não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Header Fixo */}
      <header className="px-5 pt-6 pb-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <ArrowLeft className="text-slate-600 dark:text-slate-300" size={18} />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold leading-tight truncate">{pkg.title}</h1>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin size={12} className="text-orange-500" />
              <span>Holambra, SP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with scroll */}
      <div className="flex-1 overflow-y-auto feed-scroll pb-28">
        {/* Capa */}
        <div className="h-48 bg-gradient-to-br from-orange-400 to-amber-500 relative flex items-center justify-center p-5 text-white">
          <div className="text-center z-10">
             <h2 className="text-2xl font-black mb-2">{pkg.title}</h2>
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold font-mono">
               R$ {pkg.price.toFixed(2)}
             </span>
          </div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Info Guide */}
        <div className="px-5 -mt-8 relative z-20">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-slate-700">
             <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 shadow-sm relative overflow-hidden">
                   {pkg.guide?.user?.avatar ? (
                     <Image src={pkg.guide.user.avatar} alt="Avatar" fill className="object-cover" />
                   ) : (
                     <User size={24} />
                   )}
                </div>
                <div>
                   <h3 className="font-bold text-lg">{pkg.guide?.user?.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                        <Star size={10} className="fill-amber-500" /> 5.0
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Shield size={10} className="text-green-500" /> Guia Verificado
                      </span>
                   </div>
                </div>
             </div>
             
             {pkg.guide?.bio && (
                 <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                   &quot;{pkg.guide.bio}&quot;
                 </p>
             )}

             <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300">
                   <MessageCircle size={14} className="text-blue-500" /> Idiomas: {pkg.guide?.languages || 'Português'}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300">
                   <MapPin size={14} className="text-orange-500" /> {pkg.routes?.length || 0} Roteiros
                </div>
             </div>
          </div>
        </div>

        {/* Descrição do pacote */}
        <div className="p-5 mt-2">
           <h3 className="font-bold text-lg mb-3">Sobre este pacote</h3>
           <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
             {pkg.description || "Este é um pacote completo montado especialmente para você aproveitar o melhor da nossa região com suporte de um especialista."}
           </p>
        </div>

        {/* Roteiros Inclusos */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800">
           <h3 className="font-bold text-lg mb-4">Roteiros Inclusos</h3>
           
           {pkg.routes?.length === 0 ? (
             <p className="text-sm text-slate-500">Nenhum roteiro cadastrado neste pacote.</p>
           ) : (
             <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
               
               {pkg.routes?.map((routeItem: any, idx: number) => {
                 const routeInfo = routeItem;
                 if(!routeInfo) return null;
                 
                 return (
                   <div key={idx} className="relative flex items-start gap-4">
                      {/* Linha do tempo pontinho */}
                      <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 border-2 border-orange-500 flex items-center justify-center shrink-0 shadow-sm z-10 mt-1">
                         <span className="text-xs font-bold text-orange-500">{idx + 1}</span>
                      </div>
                      
                      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                         <h4 className="font-bold text-md mb-1">{routeInfo.title}</h4>
                         {routeInfo.durationMinutes && (
                           <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                             <Clock size={12} /> Duração média: {routeInfo.durationMinutes} min
                           </div>
                         )}
                         <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                           {routeInfo.description}
                         </p>
                         
                         <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                           <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Paradas</h5>
                           <div className="flex flex-wrap gap-2 pb-1">
                             {routeInfo.places?.map((p: any, placeIdx: number) => (
                               <div key={placeIdx} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                                  <span>{p.place?.emoji || '📍'}</span>
                                  <span className="">{p.place?.name}</span>
                               </div>
                             ))}
                             {(!routeInfo.places || routeInfo.places.length === 0) && (
                               <span className="text-xs text-slate-400 italic">O roteiro ainda não possui paradas.</span>
                             )}
                           </div>
                         </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>

      </div>

      {/* Footer Fixo: CTA de Reserva */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-5 transition-all duration-300 z-20 ${showReservationForm ? 'py-5 h-[auto]' : 'py-4'}`}>
         
         {!showReservationForm ? (
           <div className="flex items-center justify-between">
             <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Preço por pessoa</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white">
                  R$ {pkg.price.toFixed(2)}
                </p>
             </div>
             <button 
               onClick={() => setShowReservationForm(true)}
               className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-orange-500/30 transition-transform active:scale-95 flex items-center gap-2"
             >
               Reservar Agora <Calendar size={18} />
             </button>
           </div>
         ) : (
           <div className="animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Finalizar Reserva</h3>
                <button onClick={() => setShowReservationForm(false)} className="text-slate-500 text-sm font-medium">Cancelar</button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
                  <input type="date" value={resDate} onChange={e => setResDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Pessoas</label>
                  <input type="number" min="1" max={pkg.maxPeople || 10} value={resGuests} onChange={e => setResGuests(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" required />
                </div>
              </div>
              
              <div className="mb-4">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Observações para o guia</label>
                 <textarea value={resNotes} onChange={e => setResNotes(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm" rows={2} placeholder="Ex: Alguém do grupo tem dificuldade de locomoção?"></textarea>
              </div>

              <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                 <span className="text-sm font-medium">Total ({resGuests} pessoas)</span>
                 <span className="text-lg font-black text-orange-500">R$ {(pkg.price * resGuests).toFixed(2)}</span>
              </div>

              <button 
                onClick={handleConfirmReservation}
                disabled={creating}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-orange-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {creating ? <Clock className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                {creating ? "Processando..." : "Confirmar e Ir para Pagamento"}
              </button>
           </div>
         )}
      </div>
    </div>
  );
}
