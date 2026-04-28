import { ArrowLeft, Check, Crown, Zap, Star, ShieldCheck, Globe, Users, MapPin, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { getActivePlans } from "@/app/actions.plans";
import { getUserSession } from "@/app/actions.auth";
import { db } from "@/lib/prisma";
import { API_BASE_URL } from "@/lib/constants";

export default async function PlanosPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success === "true";
  const plans = await getActivePlans();
  const session = await getUserSession();
  const userEmail = session?.email || "";

  // Get current user subscription
  let currentPlanId = null;
  if (session?.id) {
    const subscription = await db.subscription.findFirst({
      where: { 
        guide: { userId: session.id },
        status: "active"
      },
      orderBy: { createdAt: "desc" }
    });
    if (subscription) {
      currentPlanId = subscription.planId;
    }
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <BadgeCheck className="text-green-500" />
          <p className="font-bold">Assinatura processada com sucesso! Seu perfil será atualizado em instantes.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard/guia/perfil"
            className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center transition-all hover:bg-slate-50 text-slate-400 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Planos e Assinaturas</h1>
            <p className="text-slate-500 font-medium mt-1">Impulsione seu Perfil e ganhe mais visibilidade</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
        {plans.map((plan: any) => {
          const isFree = plan.name.toLowerCase().includes("grátis") || plan.name.toLowerCase().includes("free");
          const isCurrent = currentPlanId ? plan.id === currentPlanId : isFree;
          const isPro = plan.name.toLowerCase().includes("pro") || plan.name.toLowerCase().includes("premium");
          
          let icon = <MapPin className="text-slate-400" size={28} />;
          let btnClass = "bg-slate-100 text-slate-500 cursor-default";
          let btnText = "Plano Atual";
          
          if (isPro) {
            icon = <Crown className="text-amber-500" size={28} />;
            btnClass = "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none hover:shadow-orange-200 shadow-lg transition-all active:scale-95";
            btnText = "Assinar Pro";
          } else if (!isFree) {
            icon = <Zap className="text-indigo-500" size={28} />;
            btnClass = "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg border-none transition-all active:scale-95";
            btnText = "Upgrade Ultimate";
          }

          // Combine static features with dynamic benefits
          const features = [...(plan.features || [])];
          if (plan.maxTours !== undefined) {
            features.push(plan.maxTours >= 999 ? "Tours Ilimitados" : `Até ${plan.maxTours} tours criados`);
          }
          if (plan.maxFeaturedTours !== undefined) {
            features.push(plan.maxFeaturedTours >= 999 ? "Destaques Ilimitados" : `${plan.maxFeaturedTours} tours em destaque`);
          }
          if (plan.premiumBadge) features.push("Selo de Verificação");
          if (plan.priorityVerification) features.push("Verificação Prioritária");
          if (plan.supportWhatsapp247) features.push("Suporte via WhatsApp 24/7");
          if (plan.vipProspector) features.push("Acesso ao Prospector VIP");
          if (plan.analytics || plan.advancedAnalytics) features.push("Analytics Avançados");
          if (plan.cityMapHighlight) features.push("Destaque no Mapa");
          if (plan.touristChat) features.push("Chat com Turistas");
          if (plan.vipProfileCustomization) features.push("Personalização VIP");

          return (
            <PlanCard 
              key={plan.id}
              title={plan.name} 
              price={plan.price === 0 ? "Grátis" : `R$ ${plan.price}`} 
              period={plan.interval === "monthly" ? "/mês" : "/ano"}
              trialDays={plan.trialDays}
              popular={isPro && !isCurrent}
              description={plan.description || ""}
              icon={icon}
              features={features}
              buttonText={isCurrent ? "Plano Atual" : btnText}
              buttonClass={btnClass}
              planId={plan.id}
              isCurrent={isCurrent}
              checkoutUrl={plan.checkoutUrl}
              userEmail={userEmail}
            />
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-green-500" /> Por que evoluir seu plano?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <BenefitItem 
            icon={<Globe className="text-blue-500" />} 
            title="Mais Alcance" 
            desc="Apareça para mais turistas pesquisando por locais em Holambra."
          />
          <BenefitItem 
            icon={<Users className="text-orange-500" />} 
            title="Comunidade VIP" 
            desc="Acesso a treinamentos e workshops exclusivos para guias locais."
          />
          <BenefitItem 
            icon={<BadgeCheck className="text-amber-500" />} 
            title="Credibilidade" 
            desc="Ganhe confiança imediata com selos de verificação e planos superiores."
          />
          <BenefitItem 
            icon={<Star className="text-rose-500" />} 
            title="Recursos Exclusivos" 
            desc="Utilize ferramentas avançadas como Prospector e PagDev."
          />
        </div>
      </div>
    </div>
  );
}

function PlanCard({ title, price, period, description, icon, features, popular, buttonText, buttonClass, planId, isCurrent, trialDays, checkoutUrl, userEmail }: any) {
  // Construct the external checkout URL if not provided by the API
  const finalCheckoutUrl = checkoutUrl || `https://adm-urbano.onrender.com/subscribe/${planId}`;
  const urlWithParams = new URL(finalCheckoutUrl);
  urlWithParams.searchParams.append("external", "1");
  urlWithParams.searchParams.append("return_url", `${API_BASE_URL}/api/payment/success`);
  if (userEmail) {
    urlWithParams.searchParams.append("email", userEmail);
  }

  const isFree = price === "Grátis" || title.toLowerCase().includes("grátis");

  return (
    <div className={`relative bg-white rounded-[2rem] p-8 border transition-all flex flex-col h-full min-h-[520px] ${popular ? 'border-amber-400 shadow-xl scale-100 lg:scale-[1.05] z-10' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md z-20">
          Mais Vendido
        </div>
      )}
      
      <div className="flex items-center justify-between mb-8">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 shadow-inner">
          {icon}
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block leading-none mb-1">{title}</span>
          {trialDays > 0 && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100 inline-block">
              {trialDays} DIAS TESTE
            </span>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 tracking-tight">{price}</span>
          {!isFree && <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{period}</span>}
        </div>
        <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed min-h-[48px]">{description}</p>
      </div>

      <div className="w-full h-px bg-slate-50 mb-8" />

      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 group">
            <div className="mt-1 rounded-full bg-green-50 p-0.5 group-hover:bg-green-100 transition-colors">
              <Check size={14} className="text-green-600 shrink-0" />
            </div>
            <span className="font-semibold leading-tight">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isCurrent ? (
          <div className="w-full py-4 rounded-2xl font-bold bg-slate-50 text-slate-400 text-center border border-slate-100 text-sm">
            Seu Plano Atual
          </div>
        ) : (
          <Link 
            href={urlWithParams.toString()}
            target="_blank"
            className={`w-full py-4 rounded-2xl font-bold text-sm text-center block shadow-lg hover:shadow-xl transform transition-all active:scale-95 ${buttonClass}`}
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}

function BenefitItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
