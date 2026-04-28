"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getSubscriptions, updateSubscriptionStatus } from "@/app/actions.plans";
import { updateGuideMetadata } from "@/app/actions.admin.guias";
import { BadgeCheck, Search, Link as LinkIcon, Edit, X } from "lucide-react";
import Link from "next/link";

export default function Assinaturas() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingGuide, setEditingGuide] = useState<any>(null);
  const [metadataStr, setMetadataStr] = useState("{}");
  const [editingSub, setEditingSub] = useState<any>(null);
  const [subStatus, setSubStatus] = useState("active");
  const [subPaymentStatus, setSubPaymentStatus] = useState("paid");

  const loadSubscriptions = async () => {
    setLoading(true);
    const res = await getSubscriptions();
    if (res.success) {
      setSubscriptions(res.subscriptions || []);
    } else {
      showToast("⚠️ Erro ao carregar assinaturas: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.guide?.user?.name.toLowerCase().includes(search.toLowerCase()) || 
    sub.guide?.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    sub.plan?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveMetadata = async () => {
    if (!editingGuide) return;
    try {
      const parsed = JSON.parse(metadataStr);
      await updateGuideMetadata(editingGuide.id, parsed);
      showToast("Metadata atualizado com sucesso!");
      setEditingGuide(null);
      loadSubscriptions();
    } catch (e: any) {
      showToast("Erro: " + (e.message || "JSON inválido"));
    }
  };

  const handleSaveSubStatus = async () => {
    if (!editingSub) return;
    try {
      const res = await updateSubscriptionStatus(editingSub.id, {
        status: subStatus,
        paymentStatus: subPaymentStatus
      });
      if (res.success) {
        showToast("Assinatura atualizada com sucesso!");
        setEditingSub(null);
        loadSubscriptions();
      } else {
        showToast("Erro: " + res.error);
      }
    } catch (e: any) {
      showToast("Erro ao atualizar assinatura.");
    }
  };

  return (
    <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BadgeCheck className="text-emerald-500" />
            Gestão de Assinaturas
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe os guias e suas inscrições nos planos.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Buscar por guia ou plano..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Guia</th>
                <th className="px-6 py-4 font-semibold">Plano</th>
                <th className="px-6 py-4 font-semibold">Ciclo / Preço</th>
                <th className="px-6 py-4 font-semibold">Adesão</th>
                <th className="px-6 py-4 font-semibold">Renovação / Final do Trial</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Pagamento</th>
                <th className="px-6 py-4 font-semibold">Cupom Aplicado</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-400">Carregando assinaturas...</td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-400">Nenhuma assinatura ativa encontrada.</td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition whitespace-nowrap">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sub.guide?.user?.avatar ? (
                          <img src={sub.guide.user.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="Avatar" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-500">
                            {sub.guide?.user?.name.substring(0, 2).toUpperCase() || "??"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {sub.guide?.user?.name || "Desconhecido"}
                          </div>
                          <div className="text-xs text-slate-500">{sub.guide?.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {sub.plan?.name || "Plano Removido"}
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs uppercase font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                         {sub.plan?.interval === "annual" ? "Anual" : "Mensal"}
                       </span>
                       <div className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">
                         R$ {(sub.plan?.price || 0).toFixed(2)}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                       {new Date(sub.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                       {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR") : "Ilimitado"}
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === "active" ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Ativo</span>
                          {sub.externalSubscriptionId?.startsWith("pagdev_") && (
                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 text-[10px] font-bold uppercase px-2 py-1 rounded">PagDev (Teste)</span>
                          )}
                        </div>
                      ) : sub.status === "trialing" ? (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Trial</span>
                      ) : sub.status === "past_due" ? (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Atrasado</span>
                      ) : (
                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Cancelado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.paymentStatus === "paid" ? (
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Pago</span>
                      ) : sub.paymentStatus === "pending" ? (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Pendente</span>
                      ) : sub.paymentStatus === "failed" ? (
                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Falhou</span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       {sub.coupon ? (
                         <div className="flex gap-2 items-center">
                           <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 text-[10px] font-mono font-bold px-2 py-1 rounded">
                             {sub.coupon.code}
                           </span>
                           <span className="text-xs text-slate-500 font-bold">
                             (-{sub.coupon.discount}{sub.coupon.discountType === "percent" ? "%" : "R$"})
                           </span>
                         </div>
                       ) : (
                         <span className="text-xs text-slate-400">-</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingSub(sub);
                            setSubStatus(sub.status || "active");
                            setSubPaymentStatus(sub.paymentStatus || "pending");
                          }}
                          className="text-xs font-semibold px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center gap-1 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition"
                        >
                          <Edit size={12} /> Editar
                        </button>
                        <Link 
                          href={`/admin/guias?search=${sub.guide?.user?.email}`}
                          className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center gap-1 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                        >
                          Planos
                        </Link>
                        {(sub.plan?.name.toLowerCase().includes("pro") || sub.plan?.name.toLowerCase().includes("ultimate")) && (
                          <button
                            onClick={() => {
                              setEditingGuide(sub.guide);
                              setMetadataStr(sub.guide?.metadata || "{}");
                            }}
                            className="text-xs font-semibold px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center gap-1 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition"
                          >
                            <Edit size={12} /> Config Metadata
                          </button>
                        )}
                        <Link 
                          href={`/guia/${sub.guide?.id}`} 
                          target="_blank"
                          className="text-xs font-semibold px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg flex items-center gap-1 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 transition"
                        >
                          <LinkIcon size={12} /> Visualizar Perfil
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">Configurar Perfil Premium</h3>
                <p className="text-sm text-slate-500">Guia: {editingGuide.user?.name}</p>
              </div>
              <button onClick={() => setEditingGuide(null)} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-500 mb-2">Exemplo: {`{"cadastur": "1234", "vehicleModel": "Toyota", "vehiclePlate": "ABC-123", "vehicleColor": "Prata", "vehicleCapacity": 4}`}</p>
              <textarea
                value={metadataStr}
                onChange={(e) => setMetadataStr(e.target.value)}
                className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditingGuide(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                  Cancelar
                </button>
                <button onClick={handleSaveMetadata} className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-xl">Editar Assinatura</h3>
              <button onClick={() => setEditingSub(null)} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Status da Assinatura</label>
                <select 
                  value={subStatus} 
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="w-full border-none bg-slate-50 dark:bg-slate-800 rounded-xl py-3 px-4"
                >
                  <option value="active">Ativo</option>
                  <option value="trialing">Em Trial</option>
                  <option value="past_due">Atrasado (Past Due)</option>
                  <option value="canceled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Situação do Pagamento</label>
                <select 
                  value={subPaymentStatus} 
                  onChange={(e) => setSubPaymentStatus(e.target.value)}
                  className="w-full border-none bg-slate-50 dark:bg-slate-800 rounded-xl py-3 px-4"
                >
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="failed">Falhou / Recusado</option>
                </select>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setEditingSub(null)} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                  Cancelar
                </button>
                <button onClick={handleSaveSubStatus} className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md">
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
