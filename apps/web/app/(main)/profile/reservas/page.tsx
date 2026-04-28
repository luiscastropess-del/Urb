"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomerReservations } from "@/app/actions.reservations";

export default function ReservasPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerReservations()
      .then((data) => {
        setReservations(data);
      })
      .catch((err) => {
        showToast("Erro ao carregar reservas.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      case "CONFIRMED": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED": return "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
      case "COMPLETED": return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Pendente";
      case "CONFIRMED": return "Confirmada";
      case "CANCELLED": return "Cancelada";
      case "COMPLETED": return "Concluída";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock size={12} />;
      case "CONFIRMED": return <CheckCircle size={12} />;
      case "CANCELLED": return <XCircle size={12} />;
      case "COMPLETED": return <CheckCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <header className="px-5 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
          >
            <ArrowLeft className="text-slate-600 dark:text-slate-300" size={18} />
          </button>
          <h1 className="text-xl font-bold leading-tight">Minhas Reservas</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 feed-scroll">
        {loading ? (
          <div className="flex justify-center p-10">
            <Clock className="animate-spin text-orange-500" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium pb-4">Você ainda não tem reservas.</p>
            <button onClick={() => router.push("/pacotes")} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold">Ver Pacotes</button>
          </div>
        ) : (
          reservations.map((res) => {
            const isPending = res.status === "PENDING";
            const isConfirmed = res.status === "CONFIRMED";
            const isCompleted = res.status === "COMPLETED";

            const handleCancel = async () => {
              if(!confirm("Deseja cancelar esta reserva?")) return;
              try {
                const { cancelReservation } = await import("@/app/actions.reservations");
                await cancelReservation(res.id);
                showToast("Reserva cancelada.");
                const data = await getCustomerReservations();
                setReservations(data);
              } catch(e: any) {
                showToast(e.message || "Erro ao cancelar.");
              }
            };

            return (
              <div key={res.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <div className="pr-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{res.package?.title || "Pacote #"+res.packageId}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin size={12} className="text-orange-500" /> Holambra, SP
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(res.status)} shrink-0`}>
                     {getStatusIcon(res.status)}
                     {getStatusLabel(res.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900 rounded-xl p-3 mb-3">
                   <div>
                      <span className="block text-slate-400 mb-0.5">Data</span>
                      <span className="font-medium flex items-center gap-1"><Calendar size={12} className="text-orange-500"/> {new Date(res.date).toLocaleDateString()}</span>
                   </div>
                   <div>
                      <span className="block text-slate-400 mb-0.5">Participantes</span>
                      <span className="font-medium">{res.guests} pessoa(s)</span>
                   </div>
                   <div className="col-span-2 pt-1 mt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="block text-slate-400 mb-0.5">Guia Responsável</span>
                      <span className="font-medium">{res.package?.guide?.user?.name || res.package?.guide?.name || "N/A"}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center">
                     <div className="text-lg font-black text-slate-800 dark:text-white">
                        {res.totalPrice !== undefined ? `R$ ${res.totalPrice.toFixed(2)}` : "A Combinar"}
                     </div>
                     <button onClick={() => router.push(`/pacotes/${res.packageId}`)} className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                       Ver Pacote
                     </button>
                   </div>
                   <div className="flex gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                      {isCompleted && (
                        <button onClick={() => showToast("Avaliação em breve")} className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-xs font-bold py-2 shadow-sm">
                          Avaliar Experiência
                        </button>
                      )}
                      {(isPending || isConfirmed) && (
                        <button onClick={handleCancel} className="flex-1 bg-rose-50 text-rose-500 dark:bg-rose-900/10 dark:text-rose-400 rounded-xl text-xs font-bold py-2">
                          Cancelar Reserva
                        </button>
                      )}
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
