"use client";

import { useEffect, useState } from "react";
import { getDashboardData, registerAsGuide } from "@/app/actions.guide";
import { useToast } from "@/components/ToastProvider";
import { Loader2, Calendar as CalendarIcon, Sparkles, CloudSun, MapPin, Star, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModuleLoader from "@/components/modules/ModuleLoader";

export default function GuideDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Registration form state
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("Português");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getDashboardData();
      if (!mounted) return;
      
      if (res.error === "Não autenticado" || res.error === "Sem permissão") {
        router.push("/login");
        return;
      }
      
      setLoading(false);
      if (!res.error) {
        setData(res);
      }
    }
    load();
    return () => { mounted = false; };
  }, [router, refreshTrigger]);

  const handleViewProfile = () => {
    const subscription = data?.profile?.subscriptions?.[0];
    const plan = subscription?.plan;
    const canAccessPublic = plan ? plan.publicProfile : true;

    if (canAccessPublic) {
        window.open(`/guia/${data?.profile?.id}`, '_blank');
    } else {
        showToast("🌟 Faça upgrade para Premium para ter um perfil público");
        router.push('/dashboard/guia/perfil/planos');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const langs = languages.split(",").map(l => l.trim());
      await registerAsGuide({ bio, languages: langs });
      showToast("Solicitação enviada com sucesso! Aguarde aprovação.");
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      showToast("Erro ao processar solicitação.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  }

  if (!data) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

  const { profile } = data;
  const isPremium = profile?.subscriptions?.some((s: any) => s.status === 'active') || false;
  const isUltimate = profile?.subscriptions?.some((s: any) => s.status === 'active' && s.plan?.name?.toLowerCase().includes('ultimate')) || false;

  if (!profile) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <h1 className="text-2xl font-bold mb-2">Torne-se um Guia Parceiro</h1>
          <p className="text-slate-500 mb-8">
            Compartilhe seu conhecimento sobre Holambra, crie roteiros incríveis e seja pago por isso!
          </p>
          
          <form onSubmit={handleRegister} className="text-left space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1 text-slate-700">Biografia Resumida</label>
               <textarea 
                  required
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm h-32 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Conte um pouco sobre sua experiência como guia na região..."
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1 text-slate-700">Idiomas (separados por vírgula)</label>
               <input 
                  required
                  value={languages}
                  onChange={e => setLanguages(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  placeholder="Português, Inglês, Espanhol"
               />
             </div>
             <button 
                disabled={isRegistering}
                type="submit" 
                className="w-full p-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 mt-4"
              >
               {isRegistering ? <Loader2 className="animate-spin" /> : "Enviar Solicitação"}
             </button>
          </form>
        </div>
      </div>
    );
  }

  if (profile.status === "PENDING") {
    return (
      <div className="p-8 md:p-12 text-center max-w-lg mx-auto mt-10 bg-amber-50 border border-amber-200 rounded-3xl">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Em Análise</h2>
        <p className="text-slate-600">
          Sua solicitação de parceiro está em análise pela nossa equipe. 
          Avisaremos assim que seu painel for liberado!
        </p>
      </div>
    );
  }

  if (profile.status === "BLOCKED") {
    return <div className="p-8 text-center text-red-500 font-bold">Infelizmente, sua conta de guia foi bloqueada.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Modules Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           {isPremium ? (
               <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full font-bold shadow-md shadow-amber-500/20">
                  <i className="fas fa-crown"></i> Assinatura Premium Ativa
                  {isUltimate && (
                    <span className="ml-2 bg-white text-amber-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm">
                      <i className="fas fa-gem mr-1"></i> Ultimate
                    </span>
                  )}
               </div>
           ) : (
               <Link href="/dashboard/guia/planos" className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600 px-4 py-2 rounded-full font-bold transition-colors">
                  <i className="fas fa-arrow-up"></i> Faça Upgrade para Premium
               </Link>
           )}
           <button onClick={handleViewProfile} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-full font-bold transition-colors">
              <i className="fas fa-external-link-alt"></i> Ver Perfil Público
           </button>
        </div>

        {isUltimate && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-500/30 text-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-chart-pie text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-1">Analíticos Avançados</h3>
                <p className="text-indigo-100 text-xs text-balance">Métricas de mapa de calor, conversão de lead cruzado e desempenho de retenção.</p>
              </div>
              <Link href="/dashboard/guia/analytics" className="mt-4 bg-white text-indigo-700 text-sm font-bold py-2 rounded-xl hover:bg-indigo-50 transition-colors w-full text-center inline-block">
                Ver Métricas
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 shadow-lg shadow-rose-500/30 text-white flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-paint-brush text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-1">Personalização VIP</h3>
                <p className="text-rose-100 text-xs text-balance">Customize cores, fontes e adicione domínios próprios ao seu perfil público.</p>
              </div>
              <Link href="/vip-customization" className="mt-4 bg-white text-rose-600 text-sm font-bold py-2 rounded-xl hover:bg-rose-50 transition-colors w-full text-center">
                Personalizar
              </Link>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-500/30 text-white flex flex-col justify-between">
              <div>
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-1">Selo de Verificação Prioritária</h3>
                <p className="text-emerald-100 text-xs text-balance">Selo destacado verde exibido ao lado do seu nome para transmitir confiança máxima.</p>
              </div>
              <button className="mt-4 bg-white text-emerald-700 text-sm font-bold py-2 rounded-xl hover:bg-emerald-50 transition-colors w-full">
                <i className="fas fa-download mr-1"></i> Baixar Kit Emblema
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModuleLoader slug="weather-widget" />
        <ModuleLoader slug="ai-assistant" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3 text-slate-500 text-xs mb-2">
            <i className="fas fa-user-plus text-blue-500"></i> Novos clientes (mês)
          </div>
          <p className="text-3xl font-bold">{data.stats.novosClientes}</p>
          <span className="text-xs text-green-600"><i className="fas fa-arrow-up"></i> Mês atual</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3 text-slate-500 text-xs mb-2">
            <i className="fas fa-shopping-bag text-orange-500"></i> Pacotes vendidos
          </div>
          <p className="text-3xl font-bold">{data.stats.vendasPacotes}</p>
          <span className="text-xs text-green-600"><i className="fas fa-check"></i> Total acumulado</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3 text-slate-500 text-xs mb-2">
            <i className="fas fa-road text-green-500"></i> Km rodados (Est.)
          </div>
          <p className="text-3xl font-bold">{(data.stats.vendasPacotes * 8.5).toLocaleString()}</p>
          <span className="text-xs text-amber-600"><i className="fas fa-minus"></i> Cativando pessoas</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center gap-3 text-slate-500 text-xs mb-2">
            <i className="fas fa-map-marker-alt text-rose-500"></i> Receita (Mês)
          </div>
          <p className="text-3xl font-bold">R$ {data.stats.receitaMensal.toLocaleString()}</p>
          <span className="text-xs text-green-600"><i className="fas fa-arrow-up"></i> Consolidado</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de vendas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="font-bold text-base mb-4">📈 Vendas de pacotes (últimos 7 dias)</h3>
          <div className="flex items-end gap-3 h-40">
            {data.vendasList.map((v: any, i: number) => {
              const max = Math.max(...data.vendasList.map((x: any) => x.count), 5);
              const height = (v.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{v.count}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg transition-all duration-300" 
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400">{v.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locais mais visitados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="font-bold text-base mb-4">📍 Locais mais visitados (Tendência)</h3>
          <div className="space-y-3">
            {data.locaisPopulares.map((l: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-300 w-6">#{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{l.nome}</p>
                  <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${(l.visitas/250)*100}%` }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold">{l.visitas}</span>
                <span className="text-xs text-amber-500"><i className="fas fa-star"></i> {l.avaliacao}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Clientes recentes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="font-bold text-base mb-4">👥 Clientes recentes</h3>
          <div className="space-y-3">
            {data.clientesRecentes.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente recente.</p>}
            {data.clientesRecentes.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <p className="font-medium text-sm">{c.nome}</p>
                  <p className="text-xs text-slate-500">{c.pacote}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">R$ {c.valor.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{c.data}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Receita por pacote */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="font-bold text-base mb-4">💰 Receita por pacote</h3>
          <div className="space-y-3">
            {data.pacotesVendidos.length === 0 && <p className="text-sm text-slate-500">Nenhuma venda registrada.</p>}
            {data.pacotesVendidos.map((p: any, i: number) => {
              const max = Math.max(...data.pacotesVendidos.map((x: any) => x.vendas), 1);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32 truncate">{p.nome}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.cor} rounded-full`} style={{ width: `${(p.vendas/max)*100}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold">R$ {p.receita.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Atividades Recentes Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="text-orange-500" size={20} />
            Atividades Recentes
          </h3>
          <Link href="/dashboard/guia/atividades" className="text-sm text-orange-500 hover:underline font-medium">
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recentActivities?.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400">
              Nenhuma atividade registrada recentemente.
            </div>
          )}
          {data.recentActivities?.map((activity: any) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 transition hover:bg-slate-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                activity.type === 'CHECK_IN' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'FAVORITE' ? 'bg-rose-100 text-rose-600' :
                activity.type === 'LEVEL_UP' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {activity.type === 'CHECK_IN' && <MapPin size={18} />}
                {activity.type === 'FAVORITE' && <Star size={18} />}
                {activity.type === 'LEVEL_UP' && <ShieldCheck size={18} />}
                {!['CHECK_IN', 'FAVORITE', 'LEVEL_UP'].includes(activity.type) && <Zap size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 line-clamp-2">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">
                    {new Date(activity.createdAt).toLocaleDateString('pt-BR')} às {new Date(activity.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {activity.xpEarned > 0 && (
                    <span className="text-[10px] font-bold text-green-600">+{activity.xpEarned} XP</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
