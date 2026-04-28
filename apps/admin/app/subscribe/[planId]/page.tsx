'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, CreditCard, Loader2 } from 'lucide-react';

export default function SubscribePage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.planId as string;
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/external/plans')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === planId);
        if (found) {
          setPlan(found);
        } else {
          setError('Plano não encontrado');
        }
      })
      .catch(() => setError('Erro ao carregar plano'))
      .finally(() => setLoading(false));
  }, [planId]);

  const handleCheckout = async () => {
    setProcessing(true);
    const searchParams = new URLSearchParams(window.location.search);
    const isExternal = searchParams.get('external') === '1';
    const redirectUrl = searchParams.get('redirect');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId,
          isExternal: isExternal,
          redirectUrl: redirectUrl
        })
      });
      
      const data = await res.json();
      
      if (data.error === 'Unauthorized' || data.error === 'User ID is required') {
        // Salva intenção de compra e manda pro login
        localStorage.setItem('pending_plan', planId);
        const searchString = window.location.search;
        router.push(`/login?redirect=/subscribe/${planId}${searchString ? encodeURIComponent(searchString) : ''}`);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao processar checkout');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (error || !plan) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ops!</h1>
        <p className="text-slate-600">{error || 'Plano inválido'}</p>
        <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 font-medium">Voltar</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
        >
          <div className="bg-indigo-600 p-8 text-white">
            <h1 className="text-2xl font-bold mb-1">Finalizar Assinatura</h1>
            <p className="text-indigo-100 text-sm">Você está assinando o plano {plan.name}</p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-baseline mb-8">
              <span className="text-slate-500 font-medium">Total a pagar</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
                </span>
                <span className="text-slate-400 text-sm block">/{plan.interval === 'monthly' ? 'mês' : 'ano'}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">O que está incluso:</h3>
              <ul className="space-y-3">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                    <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                   <div className="mt-1 bg-indigo-100 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Até {plan.maxTours} roteiros ativos
                </li>
                {plan.premiumBadge && (
                  <li className="flex items-start gap-3 text-slate-600 text-sm">
                    <div className="mt-1 bg-indigo-100 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Selo Premium de Guia
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pagar agora
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-6">
              Ambiente seguro e criptografado.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
