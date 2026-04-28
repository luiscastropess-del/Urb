"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Settings, ArrowLeft, Camera, CheckCircle, Star, MapPin, Heart, Medal, ChevronRight, Bell, Shield, Crown, LogOut, IdCard, Ticket, Map, Languages
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserSession, logoutUser, getProfileStats, getRecentActivities } from "@/app/actions.auth";
import { getGuideProfileData } from "@/app/actions.guide";
import Image from "next/image";

export default function GuideProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [guideData, setGuideData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const session = await getUserSession();
        if (!session || (session.role !== "guide" && session.role !== "admin")) {
          router.replace("/login");
          return;
        }
        setUser(session);
        
        const data = await getGuideProfileData();
        if (data && !data.error) {
          setGuideData(data);
        }
        
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    showToast("👋 Você saiu da sua conta");
    router.replace("/login");
  };

  const handleViewProfile = () => {
    const subscription = guideData?.profile?.subscriptions?.[0];
    const plan = subscription?.plan;
    const canAccessPublic = plan ? plan.publicProfile : true;

    if (canAccessPublic) {
        window.open(`/guia/${guideData?.profile?.id}`, '_blank');
    } else {
        showToast("🌟 Faça upgrade para Premium para ter um perfil público");
        router.push('/dashboard/guia/perfil/planos');
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 p-1 shadow-md">
              <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-4xl overflow-hidden relative">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>🧑‍🏫</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => showToast('📷 Funcionalidade de foto em breve')} 
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200 transition-transform active:scale-95 text-blue-500"
            >
              <Camera size={14} />
            </button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 flex-wrap">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-blue-100">
                <MapPin size={12} /> Guia Local Certificado
              </span>
              <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full border border-green-100 font-bold">
                🌻 Holambra, SP
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <button onClick={handleViewProfile} className="w-full sm:w-auto px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1">
               Visualizar Perfil
             </button>
             <button onClick={() => showToast("✏️ Editar perfil em breve")} className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition">
               Editar Perfil
             </button>
             <button onClick={handleLogout} className="w-full sm:w-auto w-10 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2">
               <LogOut size={16} /> Sair
             </button>
          </div>
        </div>
        
        {/* Banner Premium */}
        <div 
          onClick={() => router.push('/dashboard/guia/perfil/planos')}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-amber-400 p-4 rounded-xl cursor-pointer hover:bg-amber-500 transition shadow-sm border border-amber-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
              <Crown size={20} className="fill-amber-500" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-slate-900">Seja Premium</h3>
              <p className="text-sm font-medium text-slate-800">Ganhe destaque e ferramentas exclusivas</p>
            </div>
          </div>
          <ChevronRight className="text-slate-900 hidden sm:block" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credenciais */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <IdCard className="text-blue-500" size={20} />
            <h3 className="font-bold text-lg text-slate-800">Credenciais</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cadastur</span>
              <p className="font-bold text-slate-800 mt-1">Ativo Verificado</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reputação</span>
              <p className="font-bold text-amber-500 flex items-center gap-1 mt-1">
                5.0 <Star size={14} className="fill-amber-500" />
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Membro desde</span>
              <p className="font-bold text-slate-800 mt-1">
                {guideData?.profile?.createdAt ? new Date(guideData.profile.createdAt).getFullYear() : 2026}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tours guiados</span>
              <p className="font-bold text-slate-800 mt-1 flex items-center gap-2">
                 <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">10+</span>
              </p>
            </div>
          </div>
        </div>

        {/* Especialidades e Idiomas */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Languages className="text-blue-500" size={18} /> Idiomas
            </h3>
            <div className="flex gap-3 flex-wrap">
              {guideData?.profile?.languages?.length > 0 ? (
                guideData.profile.languages.map((lang: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <span className="text-xl leading-none">
                        {lang.toLowerCase().includes('português') ? '🇧🇷' : lang.toLowerCase().includes('inglês') ? '🇬🇧' : lang.toLowerCase().includes('espanhol') ? '🇪🇸' : '🌍'}
                      </span>
                      <p className="text-sm font-bold text-slate-700">{lang}</p>
                  </div>
                ))
              ) : (
                <div className="flex gap-2 items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-xl leading-none">🇧🇷</span>
                  <p className="text-sm font-bold text-slate-700">Português</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Medal className="text-blue-500" size={18} /> Especialidades
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded-full font-bold">🌷 Turismo floral</span>
              <span className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded-full font-bold">📸 Fotográfico</span>
              <span className="bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-1.5 rounded-full font-bold">🍽️ Gastronômico</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pacotes publicados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Ticket className="text-blue-500" size={18} /> Meus Pacotes
             </h3>
             <button onClick={() => router.push('/dashboard/guia/pacotes')} className="text-blue-500 text-sm font-bold hover:underline">Ver todos</button>
          </div>
          
          <div className="space-y-3">
            {guideData?.profile?.packages?.length > 0 ? (
              guideData.profile.packages.map((pkg: any) => (
                <div key={pkg.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{pkg.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Até {pkg.maxPeople} pessoas • {pkg.durationDays} dias</p>
                  </div>
                  <span className="font-bold text-blue-700 text-sm bg-blue-100 px-3 py-1 rounded-lg">R$ {pkg.price}</span>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Nenhum pacote publicado ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Roteiros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Map className="text-blue-500" size={18} /> Meus Roteiros
             </h3>
             <button onClick={() => router.push('/dashboard/guia/roteiros')} className="text-blue-500 text-sm font-bold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
              {guideData?.profile?.routes?.length > 0 ? (
                guideData.profile.routes.map((rt: any) => (
                  <div key={rt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-center">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                        <MapPin size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{rt.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{rt.durationMinutes} min • {rt.places?.length || 0} locais</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Nenhum roteiro construído.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
