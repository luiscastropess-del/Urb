"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getGuideReservations } from "@/app/actions.reservations";

export default function GuideClientesPage() {
  const { showToast } = useToast();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const reservations = await getGuideReservations();
        if (!mounted) return;
        
        // Group by user, or simply list reservations as clients
        const clientsList = reservations.map(r => ({
          id: r.id,
          nome: r.customer?.name,
          pacote: r.package?.title,
          valor: r.totalPrice,
          data: new Date(r.createdAt).toLocaleDateString("pt-BR"),
          status: r.status
        }));
        
        setClientes(clientsList);
      } catch (e) {
        showToast("Erro ao carregar clientes.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">👥 Gerenciamento de Clientes</h3>
            <button 
              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-md active:scale-95" 
              onClick={() => showToast('➕ Funcionalidade em breve')}
            >
              <i className="fas fa-plus mr-1"></i> Novo
            </button>
        </div>
        
        {loading ? (
           <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-orange-500 text-2xl"></i></div>
        ) : clientes.length === 0 ? (
           <div className="text-center p-10 text-slate-500">Nenhum cliente encomendou pacotes ainda.</div>
        ) : (
          <div className="overflow-x-auto">
              <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-3">Cliente</th>
                      <th>Pacote</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                      {clientes.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-3 font-medium">{c.nome}</td>
                          <td>{c.pacote}</td>
                          <td>R$ {c.valor.toFixed(2)}</td>
                          <td>{c.data}</td>
                          <td>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              c.status === 'CONFIRMED' || c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                              c.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
}
