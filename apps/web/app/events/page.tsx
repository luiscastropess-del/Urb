"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Moon,
  Bell,
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Star,
  Filter,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getEvents } from "@/app/actions";
import { Event } from "@prisma/client";

export default function EventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shadow-lg">
              <CalendarIcon className="text-white" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <MapPin className="text-orange-500" size={12} />
                <span className="text-sm font-medium">Holambra, SP 🌷</span>
              </div>
              <h1 className="text-xl font-bold">Eventos</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <Moon className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
            <button
              onClick={() => showToast("🔔 Notificações")}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <Bell className="text-slate-600 dark:text-slate-300" size={18} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar eventos, shows..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-11 pr-24 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/50 outline-none"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 feed-scroll px-5">
        {/* Banner Expoflora */}
        <div className="mt-4 mb-5">
          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden cursor-pointer">
            <div className="absolute -top-4 -right-4 text-8xl opacity-20">
              🌸
            </div>
            <div className="relative z-10">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                🌟 Destaque
              </span>
              <h2 className="text-2xl font-bold mt-2">Expoflora 2026</h2>
              <p className="text-sm opacity-90 mt-1">
                Maior exposição de flores
              </p>
              <div className="flex gap-2 mt-4">
                <button className="bg-white text-orange-600 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  Ingressos
                </button>
                <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={14} /> Interesse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mini calendário mock */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CalendarIcon size={18} className="text-orange-500" /> Agosto 2026
            </h3>
            <div className="flex gap-1">
              <button className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ChevronLeft size={16} />
              </button>
              <button className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2 font-medium">
            <span>D</span>
            <span>S</span>
            <span>T</span>
            <span>Q</span>
            <span>Q</span>
            <span>S</span>
            <span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const hasEvent = [3, 10, 17, 22, 23].includes(day);
              const selected = day === 22;
              return (
                <div
                  key={day}
                  className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl font-medium cursor-pointer transition-colors ${selected ? "bg-orange-500 text-white" : hasEvent ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((e) => (
             <EventCard
               key={e.id}
               emoji={e.emoji}
               name={e.name}
               type={e.type}
               gradient={e.gradient}
               date={e.date}
               time={e.time}
               loc={e.loc}
             />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({ emoji, name, type, gradient, date, time, loc }: any) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm cursor-pointer">
      <div
        className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl relative`}
      >
        {emoji}
        <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <Star size={16} className="text-slate-600" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-lg leading-tight">{name}</h4>
          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] px-2 py-1 rounded-full">
            {type}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs mb-2">
          <span className="flex items-center gap-1">
            <CalendarIcon size={12} className="text-orange-500" /> {date}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon size={12} className="text-orange-500" /> {time}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          <MapPin size={12} className="inline mr-1" />
          {loc}
        </p>
      </div>
    </div>
  );
}
