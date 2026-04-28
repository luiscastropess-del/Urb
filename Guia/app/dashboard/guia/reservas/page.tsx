"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getGuideReservations, updateReservationStatus } from "@/app/actions.reservations";

export default function GuiaReservasPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      try {
        const data = await getGuideReservations();
        if (mounted) setReservations(data);
      } catch (err) {
        showToast("Erro ao carregar reservas.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, [showToast]);

  const loadData = () => {
    setLoading(true);
    getGuideReservations()
      .then((data) => {
        setReservations(data);
      })
      .catch((err) => {
        showToast("Erro ao carregar reservas.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await updateReservationStatus(id, status);
      showToast("Status da reserva atualizado!");
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) {
      showToast("Erro ao atualizar reserva.");
    } finally {
      setUpdating(null);
    }
  };

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

  const groupedReservations = reservations.reduce((acc, res) => {
    const d = new Date(res.date);
    const dateStr = d.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', weekday: 'short' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(res);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 mb-4">📅 Agenda de Tours</h3>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <i className="fas fa-spinner fa-spin text-orange-500 text-2xl"></i>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center p-10 text-slate-500">
          Você não tem tours agendados.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedReservations).map(([dia, tours]: any) => (
            <div key={dia} className="border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-orange-600">{dia}</p>
              </div>
              
              <div className="space-y-3 mt-3">
                {tours.map((t: any) => (
                  <div key={t.id} className="ml-2 flex items-start justify-between border-l-2 border-orange-200 pl-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {t.package?.title}
                      </p>
                      <p className="text-xs text-slate-500">
                         {t.guests} pessoa(s) · {t.customer?.name}
                      </p>
                      {t.notes && <p className="text-xs text-slate-400 mt-1 italic">&quot;{t.notes}&quot;</p>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusColor(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                      
                      {t.status === "PENDING" && (
                        <div className="flex gap-1 ml-2">
                          <button 
                            disabled={updating === t.id}
                            onClick={() => handleUpdateStatus(t.id, "CONFIRMED")}
                            className="bg-green-100 text-green-600 hover:bg-green-200 p-1.5 rounded-md transition"
                            title="Confirmar"
                          >
                             {updating === t.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                          </button>
                          <button 
                            disabled={updating === t.id}
                            onClick={() => handleUpdateStatus(t.id, "CANCELLED")}
                            className="bg-rose-100 text-rose-600 hover:bg-rose-200 p-1.5 rounded-md transition"
                            title="Recusar"
                          >
                             <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      
                      {t.status === "CONFIRMED" && (
                        <div className="ml-2">
                          <button 
                            disabled={updating === t.id}
                            onClick={() => handleUpdateStatus(t.id, "COMPLETED")}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-1.5 rounded-md transition text-xs font-bold"
                            title="Marcar como Concluída"
                          >
                             {updating === t.id ? <i className="fas fa-spinner fa-spin"></i> : "Concluir"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
