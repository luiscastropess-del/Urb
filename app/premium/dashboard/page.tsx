"use client";

import { useToast } from "@/components/ToastProvider";
import {
  ArrowLeft,
  Bell,
  Calendar as CalendarIcon,
  Crown,
  Eye,
  Pointer,
  Search,
  MapPin,
  Trophy,
  MousePointerClick,
  PhoneCall,
  Star,
  Camera,
  Tag,
  TrendingUp,
  Presentation,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PremiumDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState("visão geral");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative w-full border-l border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <header className="px-5 pt-6 pb-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Crown className="text-white" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Café com Flores</h1>
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm flex gap-1 items-center">
                  <Crown size={10} /> PREMIUM
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={10} className="text-amber-500" /> Holambra, SP
              </p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          >
            <ArrowLeft
              className="text-slate-600 dark:text-slate-300"
              size={18}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex gap-1 overflow-x-auto hide-scroll">
            <TabBtn
              label="Visão Geral"
              active={tab === "visão geral"}
              onClick={() => setTab("visão geral")}
            />
            <TabBtn
              label="Analytics"
              active={tab === "analytics"}
              onClick={() => setTab("analytics")}
            />
            <TabBtn
              label="Marketing"
              active={tab === "marketing"}
              onClick={() => setTab("marketing")}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-20 feed-scroll">
        {tab === "visão geral" && (
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<Eye size={14} />}
                title="Visualizações hoje"
                value="342"
                trend="+23% vs ontem"
                up
              />
              <MetricCard
                icon={<MousePointerClick size={14} />}
                title="Cliques no site"
                value="87"
                trend="+12%"
                up
              />
              <MetricCard
                icon={<PhoneCall size={14} />}
                title="Ligações"
                value="23"
                trend="Estável"
              />
              <MetricCard
                icon={<Star size={14} />}
                title="Avaliação"
                value="4.8"
                trend="+0.2"
                up
              />
            </div>

            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl p-4 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={18} className="text-yellow-200" />
                <h3 className="font-bold">Destaque Premium Ativo</h3>
              </div>
              <p className="text-xs opacity-90 mb-3 leading-relaxed">
                Você aparece em 1º lugar nas buscas por &quot;café&quot; em
                Holambra.
              </p>
              <div className="flex gap-2 text-[10px] font-medium opacity-80 mt-2">
                <span>Posição #1</span> • <span>+342 impressões</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ActionCard
                icon={<Camera className="text-amber-500" />}
                label="Foto destaque"
              />
              <ActionCard
                icon={<Tag className="text-amber-500" />}
                label="Promoção"
              />
              <ActionCard
                icon={<Presentation className="text-amber-500" />}
                label="Impulsionar"
              />
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-4 mt-2">
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3">Origem do Tráfego</h3>
              <div className="space-y-3">
                <ProgressRow
                  label="Busca no app"
                  val={45}
                  color="bg-orange-500"
                />
                <ProgressRow
                  label="Mapa/Proximidade"
                  val={30}
                  color="bg-amber-500"
                />
                <ProgressRow
                  label="Redes sociais"
                  val={15}
                  color="bg-yellow-500"
                />
              </div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3">Perfil de Visitantes</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Idade média</p>
                  <p className="font-bold">32 anos</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Turistas</p>
                  <p className="font-bold">28%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "marketing" && (
          <div className="space-y-4 mt-2">
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3">Campanhas Ativas</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl mb-2">
                <div className="flex justify-between font-medium text-sm mb-1">
                  <span>Destaque Premium</span>{" "}
                  <span className="text-green-600 text-xs text-right">
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-500">Expira em 23 dias</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${active ? "border-orange-500 text-orange-500" : "border-transparent text-slate-500"}`}
    >
      {label}
    </button>
  );
}

function MetricCard({ icon, title, value, trend, up }: any) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
        {icon} <span>{title}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p
        className={`text-[10px] mt-1 font-medium ${up ? "text-green-600" : "text-amber-600"}`}
      >
        {trend}
      </p>
    </div>
  );
}

function ActionCard({ icon, label }: any) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-xl p-3 text-center shadow-sm cursor-pointer active:scale-95 transition-transform">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
        {label}
      </p>
    </div>
  );
}

function ProgressRow({ label, val, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-medium">
        <span>{label}</span>
        <span>{val}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${val}%` }}
        ></div>
      </div>
    </div>
  );
}
