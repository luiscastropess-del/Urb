"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/app/actions.plans";
import { Ticket, Plus, Edit2, Trash2, CheckCircle, Ban, X, Search } from "lucide-react";

export default function CouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    discountType: "percent",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    const res = await getCoupons();
    if (res.success) {
      setCoupons(res.coupons || []);
    } else {
      showToast("⚠️ Erro ao carregar cupons: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenModal = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount: coupon.discount.toString(),
        discountType: coupon.discountType,
        usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : "",
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "",
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        discount: "",
        discountType: "percent",
        usageLimit: "",
        expiresAt: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount) {
      showToast("⚠️ Código e desconto são obrigatórios");
      return;
    }

    const payload = {
      ...formData,
    };

    let res;
    if (editingCoupon) {
      res = await updateCoupon(editingCoupon.id, payload);
    } else {
      res = await createCoupon(payload);
    }

    if (res.success) {
      showToast(`✅ Cupom ${editingCoupon ? "atualizado" : "criado"} com sucesso!`);
      handleCloseModal();
      loadCoupons();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    const res = await deleteCoupon(id);
    if (res.success) {
      showToast("🗑️ Cupom excluído com sucesso.");
      loadCoupons();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ticket className="text-fuchsia-500" />
            Cupons de Desconto
          </h1>
          <p className="text-slate-500 mt-1">Crie e gerencie códigos promocionais para assinaturas.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Buscar cupom..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-fuchsia-500/50 shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center gap-2 shadow-lg shadow-fuchsia-500/20 whitespace-nowrap"
          >
            <Plus size={18} /> Novo
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Desconto</th>
                <th className="px-6 py-4 font-semibold">Usos</th>
                <th className="px-6 py-4 font-semibold">Validade</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">Carregando cupons...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">Nenhum cupom configurado.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isExhausted = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition whitespace-nowrap">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-fuchsia-600 dark:text-fuchsia-400">
                        {coupon.discountType === "percent" ? `${coupon.discount}%` : `R$ ${coupon.discount.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-semibold">{coupon.usageCount}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-500">{coupon.usageLimit || "∞"}</span>
                        {isExhausted && <span className="ml-2 text-[10px] bg-rose-100 text-rose-600 px-1 rounded uppercase font-bold">Esgotado</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {coupon.expiresAt ? (
                          <div className="flex items-center gap-2">
                             {new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}
                             {isExpired && <span className="text-[10px] bg-rose-100 text-rose-600 px-1 rounded uppercase font-bold">Vencido</span>}
                          </div>
                        ) : "Vitalício"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {coupon.isActive && !isExpired && !isExhausted ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] uppercase px-2 py-1 rounded font-bold">
                            <CheckCircle size={10} /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px] uppercase px-2 py-1 rounded font-bold">
                            <Ban size={10} /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(coupon)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="text-fuchsia-500" />
                {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full">
              <form id="couponForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Código Promocional</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: BEMVINDO20, BLACKFRIDAY"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\\s+/g, '')})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tipo de Desconto</label>
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500"
                    >
                      <option value="percent">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Valor / Porcentagem</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      min="0"
                      max={formData.discountType === "percent" ? "100" : undefined}
                      placeholder={formData.discountType === "percent" ? "20" : "50.00"}
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Limite de Usos (Opcional)</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Ilimitado"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Validade Até (Opcional)</label>
                    <input 
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition">
                    <input 
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded text-fuchsia-600 focus:ring-fuchsia-500 accent-fuchsia-600"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Cupom Ativo</span>
                      <span className="text-xs text-slate-500">Permitir que este cupom seja utilizado no checkout.</span>
                    </div>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/20 shrink-0">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="couponForm"
                className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl transition shadow-lg shadow-fuchsia-500/20"
              >
                Salvar Cupom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
