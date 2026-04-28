"use client";

import { useEffect, useState } from "react";
import { getUserSession } from "@/app/actions.auth";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

import { activateSubscriptionLocal } from "@/app/actions.guide";

import { getActivePlans, checkoutExternalPlan } from "@/app/actions.plans";

export default function PlanosPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const u = await getUserSession();
        if (!u) {
          router.push("/login");
          return;
        }
        setUser(u);

        const data = await getActivePlans();
        setPlans(data || []);
      } catch (error) {
        console.error("Error loading plans:", error);
        showToast("Falha na comunicação com o servidor de planos.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, showToast]);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedPlan || !user) return;
    
    setCheckoutLoading(true);
    try {
      await checkoutExternalPlan(selectedPlan.id, user.id);
      
      // Activate locally since it succeeded
      await activateSubscriptionLocal(selectedPlan.id);
      setIsModalOpen(false);
      showToast("Assinatura ativada com sucesso 🎉");
      // Update user state locally or redirect to refresh
      router.refresh();
      router.push("/dashboard/guia");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro na comunicação com o servidor.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assinatura e Planos</h1>
        <p className="text-slate-500">Escolha o plano ideal para alavancar seu perfil como guia local.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Mais Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
            
            <div className="text-3xl font-bold text-slate-900 mb-1">
              R$ {plan.price.toFixed(2)}<span className="text-sm font-normal text-slate-500">/mês</span>
            </div>
            
            {plan.discount && (
               <p className="text-sm text-emerald-600 font-medium mb-4">Desconto: {plan.discount}</p>
            )}

            {!plan.discount && <div className="h-5 mb-4"></div>}
            
            <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600">
              {plan.features?.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => handleSelectPlan(plan)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition duration-200 text-center"
            >
              Assinar {plan.name}
            </button>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
          <i className="fas fa-box-open text-4xl text-slate-300 mb-3"></i>
          <p className="text-slate-500">Nenhum plano disponível no momento.</p>
        </div>
      )}

      {/* Modal PagDev */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Checkout Seguro</h3>
              <p className="text-sm text-slate-500">Finalize sua assinatura do {selectedPlan.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Plano selecionado</p>
                  <p className="font-semibold text-slate-800">{selectedPlan.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-900">R$ {selectedPlan.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <i className="fas fa-shield-check text-xl shrink-0 mt-0.5"></i>
                <div className="text-sm">
                  <p className="font-bold mb-1">Ambiente Integrado PagDev</p>
                  <p>A transação será processada instantaneamente de forma nativa e sem redirecionamentos externos.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={checkoutLoading}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition duration-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmCheckout}
                disabled={checkoutLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Pagar com PIX/PagDev
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
