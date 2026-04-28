"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { History, User as UserIcon, MapPin, Star, Calendar } from "lucide-react";
import { getActivities } from "@/app/actions.admin.users";

export default function UserActivityPage() {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    setLoading(true);
    const res = await getActivities();
    if (res.success) {
      setActivities(res.activities || []);
    } else {
      showToast("⚠️ Erro ao carregar atividades: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className="pt-24 px-5 pb-10 max-w-5xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <History className="text-orange-500" />
          Atividades Recentes
        </h1>
        <p className="text-slate-500 mt-1">Acompanhe o que os usuários estão fazendo na plataforma: avaliações, check-ins e XP ganho.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="py-20 text-center text-slate-400">Carregando atividades...</div>
        ) : activities.length === 0 ? (
           <div className="py-20 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
             <History size={48} className="mx-auto mb-4 opacity-10" />
             <p>Nenhuma atividade registrada recentemente.</p>
           </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                act.type === 'checkin' ? 'bg-blue-100 text-blue-600' :
                act.type === 'review' ? 'bg-orange-100 text-orange-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {act.type === 'checkin' ? <MapPin size={20} /> : 
                 act.type === 'review' ? <Star size={20} /> : 
                 <History size={20} />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {act.user.name} 
                    <span className="font-normal text-slate-500 ml-2">
                       {act.type === 'checkin' ? 'fez check-in em' : 
                        act.type === 'review' ? 'avaliou' : 
                        'realizou uma atividade em'} 
                       <span className="font-bold text-slate-700 dark:text-slate-200 ml-1">{act.place?.name || 'Local'}</span>
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono uppercase">
                    <Calendar size={10} /> {new Date(act.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                
                {act.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg italic">
                    "{act.description}"
                  </p>
                )}
                
                <div className="mt-3 flex items-center gap-4">
                   <span className="text-[10px] font-bold py-0.5 px-2 bg-emerald-100 text-emerald-700 rounded-full">
                      +{act.xpEarned} XP
                   </span>
                   <span className="text-[10px] text-slate-400">
                      ID: {act.id.split('-')[0]}
                   </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
