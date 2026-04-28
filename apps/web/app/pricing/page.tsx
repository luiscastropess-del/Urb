"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Check, X, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative w-full border-l border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          >
            <ArrowLeft
              className="text-slate-600 dark:text-slate-300"
              size={18}
            />
          </button>
          <h1 className="text-xl font-bold">Planos para Negócios</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 feed-scroll">
        <div className="text-center mt-2 mb-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Destaque seu estabelecimento em Holambra 🌷
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Alcance mais clientes e aumente suas vendas
          </p>
        </div>

        {/* Toggle Billing */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1 flex">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${billing === "monthly" ? "bg-white dark:bg-slate-700 text-orange-500 shadow-sm" : "text-slate-500"}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${billing === "yearly" ? "bg-white dark:bg-slate-700 text-orange-500 shadow-sm" : "text-slate-500"}`}
            >
              Anual{" "}
              <span className="text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <PlanCard
            name="Free"
            desc="Para começar"
            price="0"
            freq="para sempre"
            features={[
              "Perfil básico na plataforma",
              "Aparece nas buscas",
              "Até 50 visualizações/mês",
            ]}
            missing={["Sem destaque", "Sem badge verificado"]}
            button="Plano Atual"
            bgColor="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />

          <PlanCard
            name="Pro"
            desc="Para negócios em crescimento"
            price={billing === "monthly" ? "49" : "39"}
            freq="/mês"
            features={[
              "Tudo do Free +",
              "Destaque na categoria (top 10)",
              "Badge 'Verificado'",
              "Até 500 visualizações/mês",
              "Fotos ilimitadas",
            ]}
            button="Assinar Pro"
            popular
            bgColor="bg-gradient-to-r from-orange-500 to-green-500 text-white"
          />

          <PlanCard
            name="Premium"
            desc="Máxima visibilidade"
            price={billing === "monthly" ? "99" : "79"}
            freq="/mês"
            features={[
              "Tudo do Pro +",
              "Topo da busca (1º lugar)",
              "Destaque no mapa (pin especial)",
              "Visualizações ilimitadas",
              "Analytics avançado",
            ]}
            button="Assinar Premium"
            bgColor="bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900"
          />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="font-bold flex items-center gap-2 mb-3">
            <Info size={16} className="text-orange-500" /> Dúvidas frequentes
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
            <p className="text-sm font-semibold mb-1">
              Posso cancelar a qualquer momento?
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Sim, cancelamento com um clique sem multas.
            </p>

            <p className="text-sm font-semibold mb-1">
              Como funciona o período de teste?
            </p>
            <p className="text-xs text-slate-500">
              Oferecemos 7 dias grátis no plano Pro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  desc,
  price,
  freq,
  features,
  missing = [],
  button,
  popular,
  bgColor,
}: any) {
  return (
    <div
      className={`relative bg-white/70 dark:bg-slate-800/70 border ${popular ? "border-orange-500" : "border-slate-200 dark:border-slate-700"} rounded-3xl p-5`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
          Mais Popular
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-bold ${popular ? "text-orange-500" : ""}`}
          >
            R$ {price}
          </p>
          <p className="text-[10px] text-slate-500">{freq}</p>
        </div>
      </div>

      <ul className="space-y-2 mb-5">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex gap-2 text-sm">
            <Check size={16} className="text-green-500 shrink-0" />{" "}
            <span>{f}</span>
          </li>
        ))}
        {missing.map((m: string, i: number) => (
          <li key={`m-${i}`} className="flex gap-2 text-sm text-slate-400">
            <X size={16} className="shrink-0" /> <span>{m}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-xl font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform ${bgColor}`}
      >
        {button}
      </button>
    </div>
  );
}
