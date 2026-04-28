"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Moon,
  Settings,
  ArrowLeft,
  Camera,
  CheckCircle,
  Star,
  MapPin,
  Heart,
  Medal,
  Image as ImageIcon,
  ChevronRight,
  Bell,
  Shield,
  Crown,
  LogOut,
  Sprout,
  Flag,
  RotateCcw,
  UserPen,
  CircleHelp,
  Clock,
  Check,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserSession, logoutUser, getProfileStats, getRecentActivities } from "@/app/actions.auth";
import Image from "next/image";

export default function ProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ favorites: 0, reviews: 0, checkins: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const session = await getUserSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        setUser(session);
        
        const [userStats, recentActivities] = await Promise.all([
          getProfileStats(session.id),
          getRecentActivities(session.id)
        ]);
        
        setStats(userStats);
        setActivities(recentActivities);
      } catch (err) {
        console.error("Failed to load profile data", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    await logoutUser();
    showToast("👋 Você saiu da sua conta");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Carregando seu perfil...</p>
      </div>
    );
  }

  if (!user) return null;

  const xpProgress = user.xp % 500;
  const progressPercentage = (xpProgress / 500) * 100;
  const xpRemaining = 500 - xpProgress;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Header fixo */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="text-slate-600 dark:text-slate-300" size={20} />
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={toggleDarkMode} className="h-10 w-10 flex items-center justify-center">
            <Moon className="text-slate-600 dark:text-slate-300" size={20} />
          </button>
          <button onClick={() => showToast("⚙️ Configurações em breve")} className="h-10 w-10 flex items-center justify-center">
            <Settings className="text-slate-600 dark:text-slate-300" size={20} />
          </button>
        </div>
      </header>

      {/* Área com scroll */}
      <div className="flex-1 overflow-y-auto feed-scroll px-5 pb-24">
        
        {/* Cabeçalho do perfil */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-orange-500 to-green-500 p-1 shadow-xl">
              <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-5xl overflow-hidden relative">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-4xl">👩🏻‍🌾</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => router.push('/profile/edit')} 
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-600 transition-transform active:scale-90"
            >
              <Camera className="text-orange-500" size={16} />
            </button>
          </div>
          <h2 className="text-2xl font-bold mt-3">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Sprout size={12} /> Explorador Nível {user.level}
            </span>
            <span className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              🌻 Holambra
            </span>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full mt-5">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>🌟 {user.xp} XP</span>
              <span className="text-orange-500 font-bold">Próximo nível: {user.level + 1}</span>
            </div>
            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-1000" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right italic">Faltam {xpRemaining} XP para o próximo nível</p>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={<CheckCircle size={18} className="text-orange-500" />} value={stats.checkins} label="Check-ins" />
          <StatCard icon={<Star size={18} className="text-amber-400" />} value={stats.reviews} label="Avaliações" />
          <StatCard icon={<Heart size={18} className="text-rose-500" />} value={stats.favorites} label="Favoritos" />
        </div>

        {/* Conquistas (Badges) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Medal className="text-amber-500" size={20} /> Conquistas
            </h3>
            <span className="text-xs text-orange-500 font-medium cursor-pointer">Ver todas</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scroll scroll-smooth">
            <Badge icon="🌷" name="Tulipa de Ouro" desc="5 check-ins" gradient="from-amber-400 to-orange-500" active={stats.checkins >= 5} />
            <Badge icon="🌻" name="Girassol" desc="Prêmio Beta" gradient="from-green-400 to-emerald-500" active={true} />
            <Badge icon="🇳🇱" name="Holandês" desc="1º login" gradient="from-blue-400 to-indigo-500" active={true} />
            <Badge icon="🔒" name="Moinho" desc="20 check-ins" gradient="from-slate-300 to-slate-400" active={stats.checkins >= 20} isLocked={stats.checkins < 20} />
          </div>
        </div>

        {/* Missões ativas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Flag className="text-orange-500" size={20} /> Missões
            </h3>
            <span className="text-xs text-orange-500 font-medium cursor-pointer" onClick={() => showToast('📅 Mais missões em breve!')}>Ver todas</span>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <MissionItem 
              icon="🌷" 
              title="Explorar Holambra" 
              current={stats.checkins} 
              target={10} 
              color="orange" 
            />
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-3"></div>
            <MissionItem 
              icon="⭐" 
              title="Crítico de Flores" 
              current={stats.reviews} 
              target={5} 
              color="green" 
            />
          </div>
        </div>

        {/* Atividade recente */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Clock className="text-slate-500" size={20} /> Atividade recente
          </h3>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 italic">Nenhuma atividade registrada ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Opções de conta */}
        <div className="space-y-2 mb-6">
          <div className="pb-2">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Turismo</h4>
              <ProfileLink 
                 icon={<Calendar className="text-orange-500" size={18} />} 
                 label="Minhas Reservas" 
                 onClick={() => router.push('/profile/reservas')} 
              />
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Configurações</h4>
          <ProfileLink icon={<UserPen className="text-orange-500" size={18} />} label="Editar Perfil" onClick={() => router.push('/profile/edit')} />
          <ProfileLink icon={<Bell className="text-orange-500" size={18} />} label="Notificações" onClick={() => showToast('🔔 Notificações')} />
          <ProfileLink icon={<Shield className="text-orange-500" size={18} />} label="Privacidade" onClick={() => showToast('🔒 Privacidade')} />
          <ProfileLink icon={<RotateCcw className="text-orange-500" size={18} />} label="Histórico de Compras" onClick={() => showToast('🧾 Histórico')} />
          <ProfileLink icon={<CircleHelp className="text-orange-500" size={18} />} label="Ajuda e Suporte" onClick={() => showToast('❓ Suporte')} />
          
          <div className="mt-4 pb-2">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Parceiros</h4>
             <ProfileLink 
               icon={<Crown className="text-emerald-500" size={18} />} 
               label="Seja um Guia Local" 
               onClick={() => window.open('https://local-urbano.onrender.com', '_blank')} 
             />
          </div>
        </div>

        {/* Botão de logout */}
        <button 
          onClick={handleLogout} 
          className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 text-rose-500 font-bold text-sm mb-4 border border-rose-100 dark:border-rose-900/30 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-rose-50 dark:hover:bg-rose-900/10"
        >
          <LogOut size={16} /> Sair da conta
        </button>

      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-800 rounded-2xl p-3 text-center shadow-sm">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
    </div>
  );
}

function Badge({ icon, name, desc, gradient, active, isLocked }: any) {
  return (
    <div className={`flex-shrink-0 w-24 bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 dark:border-slate-800 rounded-2xl p-3 flex flex-col items-center transition-all ${!active ? 'opacity-50' : 'shadow-sm'}`}>
      <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${isLocked ? 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800' : gradient} flex items-center justify-center text-white text-xl shadow-md border-2 border-white dark:border-slate-700`}>
        {icon}
      </div>
      <span className="text-xs font-bold mt-2 text-center truncate w-full">{name}</span>
      <span className="text-[9px] text-slate-400 text-center">{desc}</span>
    </div>
  );
}

function MissionItem({ icon, title, current, target, color }: any) {
  const percentage = Math.min(100, (current / target) * 100);
  const colorClass = color === 'orange' ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="font-bold text-sm truncate">{title}</p>
          <span className={`text-xs font-bold text-${color}-500 whitespace-nowrap`}>{current}/{target}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'CHECK_IN': return <Check size={16} />;
      case 'FAVORITE': return <Heart size={16} className="fill-rose-500 text-rose-500" />;
      case 'REVIEW': return <Star size={16} className="fill-amber-400 text-amber-400" />;
      case 'LEVEL_UP': return <Crown size={16} className="text-orange-500" />;
      default: return < ImageIcon size={16} />;
    }
  };

  const getBg = () => {
    switch (activity.type) {
      case 'CHECK_IN': return 'bg-green-100 dark:bg-green-950/30 text-green-600';
      case 'FAVORITE': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-500';
      case 'REVIEW': return 'bg-amber-100 dark:bg-amber-950/30 text-amber-600';
      default: return 'bg-orange-50 dark:bg-orange-950/30 text-orange-500';
    }
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Há ${days}d`;
    if (hours > 0) return `Há ${hours}h`;
    if (minutes > 0) return `Há ${minutes}m`;
    return 'Agora';
  };

  return (
    <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/20 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
      <div className={`h-11 w-11 rounded-full ${getBg()} shrink-0 flex items-center justify-center`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{activity.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-slate-400 font-medium">{timeAgo(activity.createdAt)}</p>
          {activity.xpEarned > 0 && (
            <span className="text-[10px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-950/30 px-1.5 rounded">+{activity.xpEarned} XP</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] hover:bg-white/90 dark:hover:bg-slate-800 shadow-sm"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{label}</span>
      </div>
      <ChevronRight className="text-slate-400" size={16} />
    </div>
  );
}

