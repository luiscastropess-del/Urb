"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getClientes, updateClientePlan, deleteCliente, approvePayment, cancelPlan } from "@/app/actions.admin.clientes";
import { 
  Users, Trash2, Edit2, CheckCircle, Ban, CreditCard, Search, Mail, Shield, ShieldAlert 
} from "lucide-react";

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("free");
  const [editPayment, setEditPayment] = useState("PENDING");

  const loadClients = async () => {
    setLoading(true);
    const res = await getClientes();
    if (res.success) {
      setClients(res.clientes || []);
    } else {
      showToast("⚠️ Erro ao carregar clientes: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleUpdate = async (id: string) => {
    const res = await updateClientePlan(id, editPlan, editPayment);
    if (res.success) {
      showToast("✅ Cliente atualizado com sucesso");
      setEditingId(null);
      loadClients();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este usuário?")) return;
    const res = await deleteCliente(id);
    if (res.success) {
      showToast("🗑️ Usuário excluído");
      loadClients();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const handleApprovePayment = async (id: string) => {
    if (!confirm("Confirmar o recebimento do pagamento e ativar plano?")) return;
    const res = await approvePayment(id);
    if (res.success) {
      showToast("💳 Pagamento aprovado com sucesso");
      loadClients();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const handleCancelPlan = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar a assinatura deste cliente? Ele perderá os benefícios.")) return;
    const res = await cancelPlan(id);
    if (res.success) {
      showToast("🚫 Plano cancelado");
      loadClients();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.plan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-orange-500" />
            Gestão de Clientes
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os usuários, assinaturas, planos e pagamentos do aplicativo.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou plano..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Plano</th>
                <th className="px-6 py-4 font-semibold">Status Pagto.</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">Carregando clientes...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isEditing = editingId === client.id;

                  return (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition whitespace-nowrap">
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          {client.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Mail size={12} /> {client.email}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Criado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          client.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          client.role === 'guide' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {client.role === 'admin' && <ShieldAlert size={10} className="inline mr-1" />}
                          {client.role === 'guide' && <Shield size={10} className="inline mr-1" />}
                          {client.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select 
                            value={editPlan} 
                            onChange={e => setEditPlan(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-md text-sm p-2 w-full min-w-[120px] focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="pro">Pro</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                            client.plan === 'pro' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            client.plan === 'premium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {client.plan}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select 
                            value={editPayment} 
                            onChange={e => setEditPayment(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-md text-sm p-2 w-full min-w-[120px] focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="PAID">Pago</option>
                            <option value="OVERDUE">Atrasado</option>
                            <option value="CANCELLED">Cancelado</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase ${
                            client.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            client.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            client.paymentStatus === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {client.paymentStatus || 'FREE'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition">
                              Cancelar
                            </button>
                            <button onClick={() => handleUpdate(client.id)} className="p-2 bg-gradient-to-r from-[#f97316] to-[#22c55e] text-white hover:opacity-90 rounded-md transition font-bold text-xs shadow-md shadow-orange-500/20">
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {/* Aprovar pagamento rápido (se pending/overdue e plan não for free) */}
                            {client.plan !== 'free' && client.paymentStatus !== 'PAID' && (
                              <button 
                                onClick={() => handleApprovePayment(client.id)}
                                title="Emitir/Aprovar Pagamento"
                                className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition"
                              >
                                <CreditCard size={16} />
                              </button>
                            )}

                            {/* Cancelar plano rápido */}
                            {client.plan !== 'free' && (
                              <button 
                                onClick={() => handleCancelPlan(client.id)}
                                title="Cancelar Plano"
                                className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition"
                              >
                                <Ban size={16} />
                              </button>
                            )}

                            {/* Editar tudo */}
                            <button 
                              onClick={() => {
                                setEditingId(client.id);
                                setEditPlan(client.plan);
                                setEditPayment(client.paymentStatus || "PENDING");
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* Excluir DB */}
                            <button 
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
