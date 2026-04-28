"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getPlans, createPlan, updatePlan, deletePlan } from "@/app/actions.plans";
import { Package, Plus, Edit2, Trash2, CheckCircle, Ban, X } from "lucide-react";

export default function PlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("guide");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
    trialDays: "0",
    features: "",
    externalPriceId: "",
    isActive: true,
    provider: "PAGDEV"
  });

  const loadPlans = async () => {
    setLoading(true);
    const res = await getPlans();
    if (res.success) {
      setPlans(res.plans || []);
      setRole(res.role || "guide");
    } else {
      showToast("⚠️ Erro ao carregar planos: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      setCheckoutLoading(planId);
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ planId }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        showToast("⚠️ Erro ao iniciar checkout: " + data.error);
        setCheckoutLoading(null);
      }
    } catch (e: any) {
      showToast("⚠️ Erro: " + e.message);
      setCheckoutLoading(null);
    }
  };

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || "",
        price: plan.price.toString(),
        interval: plan.interval,
        trialDays: plan.trialDays.toString(),
        features: plan.features ? plan.features.join("\n") : "",
        externalPriceId: plan.externalPriceId || "",
        isActive: plan.isActive,
        provider: plan.provider || "PAGDEV"
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        interval: "monthly",
        trialDays: "0",
        features: "",
        externalPriceId: "",
        isActive: true,
        provider: "PAGDEV"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast("⚠️ Nome e preço são obrigatórios");
      return;
    }

    const payload = {
      ...formData,
      features: formData.features.split("\n").filter((f) => f.trim() !== ""),
    };

    let res;
    if (editingPlan) {
      res = await updatePlan(editingPlan.id, payload);
    } else {
      res = await createPlan(payload);
    }

    if (res.success) {
      showToast(`✅ Plano ${editingPlan ? "atualizado" : "criado"} com sucesso!`);
      handleCloseModal();
      loadPlans();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano? Entrará em desuso mas as assinaturas ativas manterão.")) return;
    const res = await deletePlan(id);
    if (res.success) {
      showToast("🗑️ Plano excluído com sucesso.");
      loadPlans();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Package className="text-indigo-500" />
            Planos de Assinatura
          </h1>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">
            Venda roteiros e ganhe visibilidade escolhendo o plano ideal para suas guias locais.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Carregando planos...</div>
        ) : plans.length === 0 ? (
           <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl shadow">Nenhum plano disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 transition-colors relative">
                {plan.trialDays > 0 && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    {plan.trialDays} dias grátis
                  </div>
                )}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <div className="my-4">
                     <span className="text-4xl font-extrabold text-slate-900 dark:text-white">R$ {plan.price.toFixed(2)}</span>
                     <span className="text-slate-500 text-sm">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
                  </div>
                  <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                   <ul className="space-y-3 mb-8 flex-1">
                     {plan.features.map((feature: string, idx: number) => (
                       <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                         <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                         <span>{feature}</span>
                       </li>
                     ))}
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(plan.id)}
                     disabled={checkoutLoading === plan.id}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex justify-center items-center h-12 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                   >
                     {checkoutLoading === plan.id ? 'Aguarde...' : 'Assinar Agora'}
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="text-indigo-500" />
            Planos de Assinatura
          </h1>
          <p className="text-slate-500 mt-1">Configure os planos de assinatura disponíveis para os Guias Locais.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Preço</th>
                <th className="px-6 py-4 font-semibold">Ciclo</th>
                <th className="px-6 py-4 font-semibold">Provedor</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">Carregando planos...</td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">Nenhum plano configurado.</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{plan.name}</div>
                      <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{plan.description || "Sem descrição"}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      R$ {plan.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded inline-block font-medium">
                        {plan.interval === "monthly" ? "Mensal" : "Anual"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${plan.provider === 'PAGDEV' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {plan.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {plan.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2 py-1 rounded font-bold">
                          <CheckCircle size={12} /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs px-2 py-1 rounded font-bold">
                          <Ban size={12} /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(plan)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(plan.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="text-indigo-500" />
                {editingPlan ? "Editar Plano" : "Novo Plano"}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <form id="planForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nome do Plano</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Pro, Premium, Básico"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Descrição (Opcional)</label>
                    <textarea 
                      placeholder="Breve descrição do plano..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Preço (R$)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Ciclo de Cobrança</label>
                    <select 
                      value={formData.interval}
                      onChange={(e) => setFormData({...formData, interval: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Período de Teste Grátis (Dias)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.trialDays}
                      onChange={(e) => setFormData({...formData, trialDays: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Provedor de Pagamento</label>
                    <select 
                      value={formData.provider}
                      onChange={(e) => setFormData({...formData, provider: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="MERCADO_PAGO">Mercado Pago</option>
                      <option value="PAGDEV">PagDev (Modo Teste/Desenvolvedor)</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      ID do Plano no Gateway de Pagamento (Price ID / Plan ID)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: plan_1xyz... ou 2c9380847... "
                      value={formData.externalPriceId}
                      onChange={(e) => setFormData({...formData, externalPriceId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>O que é isso?</strong> É o código de identificação que o Mercado Pago (ou outro provedor) gera quando você cria um plano de assinatura lá no painel deles. O nosso sistema precisa desse código para saber qual plano cobrar do cliente na hora do checkout.
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Recursos (Um por linha)</label>
                    <textarea 
                      rows={4}
                      placeholder="Ex:&#10;Destaque nos resultados&#10;Até 10 Roteiros ativos&#10;Suporte prioritário"
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Plano Ativo</span>
                        <span className="text-xs text-slate-500">Exibir este plano para novos assinantes.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="planForm"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20"
              >
                Salvar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
