"use client";

import { useEffect, useState } from "react";
import { getAllReservations, getReservationStats } from "@/app/actions.admin.reservations";
import { useToast } from "@/components/ToastProvider";
import { Calendar, DollarSign, Search, CheckCircle, Clock, XCircle, ChevronRight, Activity } from "lucide-react";

export default function AdminReservationsPage() {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resData, statsData] = await Promise.all([
        getAllReservations(),
        getReservationStats()
      ]);
      setReservations(resData);
      setStats(statsData);
    } catch (e) {
      showToast("Erro ao carregar os dados de reservas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold w-fit">Confirmado</span>;
      case "COMPLETED": return <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-md text-xs font-bold w-fit">Concluído</span>;
      case "PENDING": return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold w-fit">Pendente</span>;
      case "CANCELLED": return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold w-fit">Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-orange-500" /> Visão Global de Reservas
        </h1>
        <p className="text-sm text-slate-500 mt-1">Acompanhe todas as reservas feitas no City Ventures e o volume de vendas.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-slate-500 font-semibold mb-2 flex items-center gap-2"><Activity size={16}/> Total de Reservas</div>
              <div className="text-2xl font-black">{stats.total}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-green-500 font-semibold mb-2 flex items-center gap-2"><CheckCircle size={16}/> Confirmadas</div>
              <div className="text-2xl font-black">{stats.confirmed}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-sky-500 font-semibold mb-2 flex items-center gap-2"><CheckCircle size={16}/> Concluídas (Pagas)</div>
              <div className="text-2xl font-black">{stats.completed}</div>
           </div>
           <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl p-4 shadow-sm">
              <div className="text-sm font-semibold mb-2 text-orange-100 flex items-center gap-2"><DollarSign size={16}/> Receita Total (Bruta)</div>
              <div className="text-2xl font-black">R$ {stats.totalRevenue.toFixed(2)}</div>
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar reserva..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guia & Pacote</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data do Tour</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading && <tr><td colSpan={6} className="p-8 text-center"><Clock className="animate-spin inline mr-2 text-orange-500"/> Buscando dados...</td></tr>}
              {!loading && reservations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma reserva encontrada.</td></tr>}
              {!loading && reservations.map(res => (
                <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                  <td className="p-4 text-xs font-mono text-slate-400">{res.id.split('-')[0]}</td>
                  <td className="p-4">{getStatusBadge(res.status)}</td>
                  <td className="p-4">
                     <div className="font-bold text-sm">{res.customer?.name}</div>
                     <div className="text-xs text-slate-500">{res.customer?.email}</div>
                  </td>
                  <td className="p-4">
                     <div className="font-bold text-sm line-clamp-1">{res.package?.title}</div>
                     <div className="text-xs text-orange-500">Guia: {res.package?.guide?.user?.name}</div>
                  </td>
                  <td className="p-4 text-sm font-medium">
                     {new Date(res.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                     <div className="font-bold text-sm">R$ {res.totalPrice.toFixed(2)}</div>
                     <div className="text-[10px] text-slate-500">{res.guests} pax</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
