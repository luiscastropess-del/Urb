'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle2, Home } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'Premium';

  return (
    <motion.div 
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
    >
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Pagamento Confirmado!</h1>
      <p className="text-slate-600 mb-8">
        Parabéns! Sua assinatura do plano <span className="font-bold text-indigo-600">{planName}</span> foi ativada com sucesso.
      </p>

      <div className="space-y-3">
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Ir para o Início
        </button>
        
        <p className="text-xs text-slate-400">
          Você já pode fechar esta janela e voltar para seu aplicativo.
        </p>
      </div>
    </motion.div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-500 font-medium">Carregando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
