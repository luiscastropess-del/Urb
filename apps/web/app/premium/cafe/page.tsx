"use client";

import { useToast } from "@/components/ToastProvider";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Wifi,
  CreditCard,
  ParkingCircle,
  Instagram,
  MessageCircle,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PremiumCafePage() {
  const { showToast } = useToast();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative w-full border-l border-r border-slate-200 dark:border-slate-800">
      {/* Hero Image */}
      <div className="h-56 shrink-0 relative bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 dark:from-amber-900/40 dark:via-orange-900/30 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
          ☕🌷
        </div>
        <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-amber-500/30 z-10">
          👑 PREMIUM
        </div>
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-md z-10"
        >
          <ArrowLeft className="text-slate-700 dark:text-slate-200" size={18} />
        </button>

        {/* Avatar logo */}
        <div className="absolute -bottom-6 left-5 z-20">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-xl">
            <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl">
              ☕
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-10 pb-24 feed-scroll">
        <div className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Café com Flores
            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full flex gap-1 items-center">
              <Star size={10} className="fill-amber-500" /> Verificado
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 text-wrap">
            Café & Bistrô • 4.8 (342) • Centro
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <InfoCard icon={<Clock />} label="Aberto" val="8h - 19h" />
          <InfoCard icon={<Wifi />} label="Wi-fi" val="Grátis" />
          <InfoCard icon={<CreditCard />} label="Pagamento" val="Todos" />
          <InfoCard icon={<ParkingCircle />} label="Estac." val="Próprio" />
        </div>

        <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
          <h3 className="font-bold mb-2">🌸 Sobre</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
            Um pedacinho da Holanda em Holambra! Ambiente aconchegante rodeado
            de flores, com cafés especiais, bolos caseiros e o famoso
            stroopwafel.
          </p>
        </div>

        {/* Instagram Grid (Premium Feature) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Instagram className="text-pink-500" size={18} /> Instagram
            </h3>
            <button className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
              Seguir
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
            <InstaBox emoji="🍰" color="bg-rose-200 text-rose-600" />
            <InstaBox emoji="☕" color="bg-amber-200 text-amber-600" />
            <InstaBox emoji="🌷" color="bg-green-200 text-green-600" />
            <InstaBox emoji="🧇" color="bg-yellow-200 text-yellow-600" />
            <InstaBox emoji="😊" color="bg-blue-200 text-blue-600" />
            <InstaBox emoji="📷" color="bg-purple-200 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Floating Bottom action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex gap-3">
        <button
          className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform"
          onClick={() => showToast("✅ Check-in feito!")}
        >
          Fazer Check-in
        </button>
        <button className="h-14 w-14 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800">
          <Heart size={20} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, val }: any) {
  return (
    <div className="border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 flex gap-3 items-center">
      <div className="text-orange-500 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className="text-xs font-bold">{val}</p>
      </div>
    </div>
  );
}

function InstaBox({ emoji, color }: any) {
  return (
    <div
      className={`aspect-square ${color} flex items-center justify-center text-3xl cursor-pointer hover:opacity-90 transition-opacity`}
    >
      {emoji}
    </div>
  );
}
