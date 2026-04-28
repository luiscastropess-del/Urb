"use client";

import { CloudSun, Droplets, Thermometer, Wind } from "lucide-react";
import { useEffect, useState } from "react";

export function WeatherModule() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Simulating external API call
    setTimeout(() => {
      setWeather({
        temp: 24,
        condition: "Ensolarado",
        humidity: 65,
        wind: 12
      });
    }, 1000);
  }, []);

  if (!weather) return <div className="animate-pulse bg-slate-100 h-24 rounded-2xl"></div>;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg overflow-hidden relative group">
      <CloudSun className="absolute -right-2 -top-2 text-white/20" size={80} />
      
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-1">Clima em Holambra</p>
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-extrabold">{weather.temp}°</h2>
          <div>
            <p className="font-bold">{weather.condition}</p>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <Thermometer size={10} /> Sensação 26°
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-[10px] bg-white/10 px-2 py-1 rounded-lg">
            <Droplets size={12} /> {weather.humidity}% Humidade
          </div>
          <div className="flex items-center gap-2 text-[10px] bg-white/10 px-2 py-1 rounded-lg">
            <Wind size={12} /> {weather.wind}km/h Vento
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIAssistantModule() {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 bg-purple-500/10 h-32 w-32 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
          <Sparkles size={20} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-tighter">Powered by Gemini</span>
      </div>

      <h3 className="font-bold text-slate-800 dark:text-white mb-2 italic">&quot;Como posso otimizar seu roteiro hoje?&quot;</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Use IA para gerar descrições atraentes para seus pacotes baseadas nos locais favoritos de Holambra.
      </p>

      <button className="w-full py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[11px] font-bold transition-transform active:scale-95">
        Gerar Sugestões
      </button>
    </div>
  );
}

import { Sparkles } from "lucide-react";
