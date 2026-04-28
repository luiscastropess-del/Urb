"use client";

import { useEffect, useState } from "react";
import { getUserSession, getRecentActivities } from "@/app/actions.auth";
import { Loader2, ArrowLeft, MapPin, Star, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GuideActivitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const user = await getUserSession();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const res = await getRecentActivities(user.id);
      setActivities(res);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/guia" 
          className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-colors hover:bg-slate-50 text-slate-600 shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Atividades</h1>
          <p className="text-slate-500 mt-1">Veja sua jornada e XP acumulao</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Sparkles className="mx-auto mb-4 text-slate-300" size={48} />
              <p>Nenhuma atividade encontrada.</p>
              <p className="text-sm">Comece a explorar e interagir com o app!</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition hover:bg-slate-100 hover:border-slate-200">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  activity.type === 'CHECK_IN' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'FAVORITE' ? 'bg-rose-100 text-rose-600' :
                  activity.type === 'LEVEL_UP' ? 'bg-amber-100 text-amber-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {activity.type === 'CHECK_IN' && <MapPin size={24} />}
                  {activity.type === 'FAVORITE' && <Star size={24} />}
                  {activity.type === 'LEVEL_UP' && <ShieldCheck size={24} />}
                  {!['CHECK_IN', 'FAVORITE', 'LEVEL_UP'].includes(activity.type) && <Zap size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                    <p className="text-base font-bold text-slate-800">{activity.description}</p>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-white px-2 py-1 rounded-full border border-slate-200">
                      {new Date(activity.createdAt).toLocaleDateString('pt-BR')} às {new Date(activity.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                      {activity.type.replace('_', ' ')}
                    </span>
                    {activity.xpEarned > 0 && (
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <Zap size={14} fill="currentColor" />
                        +{activity.xpEarned} XP
                      </span>
                    )}
                  </div>
                  {activity.place && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-100 flex items-center gap-3">
                      {activity.place.coverImage ? (
                        <img src={activity.place.coverImage} className="w-10 h-10 rounded-lg object-cover" alt={activity.place.name} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                          {activity.place.emoji}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-700">{activity.place.name}</p>
                        <p className="text-[10px] text-slate-400">{activity.place.address}</p>
                      </div>
                      <Link 
                        href={`/place/${activity.place.id}`}
                        className="ml-auto p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                      >
                        <Zap size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
