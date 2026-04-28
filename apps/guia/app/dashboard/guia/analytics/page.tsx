'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { getGuideAnalytics } from '@/app/actions.analytics';

const heatmapDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const heatmapHours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00+'];

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getGuideAnalytics();
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'bg-slate-50 border-slate-100';
    if (intensity <= 2) return 'bg-orange-100 border-orange-200';
    if (intensity <= 5) return 'bg-orange-300 border-orange-400';
    if (intensity <= 8) return 'bg-orange-500 border-orange-600 outline-none shadow-md shadow-orange-500/30';
    return 'bg-orange-600 border-orange-700 outline-none shadow-lg shadow-orange-600/40 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Erro ao carregar dados analíticos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/guia" className="h-10 w-10 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full flex items-center justify-center text-slate-600">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <i className="fas fa-chart-pie text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Analíticos Avançados</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Métricas VIP e Conversão</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Conversão Geral', value: `${data.kpis.conversionRate}%`, trend: '+2.1%', icon: 'fa-bolt', color: 'from-orange-400 to-orange-500' },
            { label: 'Receita Est. VIP', value: `R$ ${data.kpis.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '+15%', icon: 'fa-dollar-sign', color: 'from-green-500 to-emerald-600' },
            { label: 'Retenção Tot.', value: `${data.kpis.retentionRate.toFixed(1)}%`, trend: '+4.0%', icon: 'fa-users', color: 'from-blue-500 to-indigo-600' },
            { label: 'Total Reservas', value: `${data.kpis.reservations}`, trend: 'Mês Atual', icon: 'fa-calendar-check', color: 'from-purple-500 to-pink-600' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-black text-slate-800">{kpi.value}</h3>
                <p className="text-xs font-semibold text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-full"><i className="fas fa-arrow-up mr-1 hover:-translate-y-0.5 transition-transform"></i> {kpi.trend}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg relative z-10 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${kpi.icon} text-lg`}></i>
              </div>
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.color} opacity-10 blur-2xl`}></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Heatmap Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-fire text-orange-500"></i> Mapa de Calor de Engajamento
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Descubra os horários de pico de acesso dos turistas.</p>
              </div>
              <div className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Fuso: Horário de Brasília (BRT)
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-8 gap-2 mb-2">
                  <div className="text-xs font-bold text-slate-400 text-center"></div>
                  {heatmapDays.map(d => (
                    <div key={d} className="text-xs font-bold text-slate-500 text-center uppercase">{d}</div>
                  ))}
                </div>
                
                {heatmapHours.map((hour, hIdx) => (
                  <div key={hour} className="grid grid-cols-8 gap-2 mb-2 items-center">
                    <div className="text-xs font-bold text-slate-400 text-right pr-2">{hour}</div>
                    {heatmapDays.map((day, dIdx) => {
                      const dataPoint = data.heatmapData.find((d: any) => d.day === dIdx && d.hour === hIdx);
                      const intensity = dataPoint ? dataPoint.intensity : 0;
                      return (
                        <div 
                          key={`${dIdx}-${hIdx}`} 
                          className={`h-10 rounded-xl border ${getHeatmapColor(intensity)} transition-all hover:scale-105 cursor-pointer relative group flex items-center justify-center`}
                          title={`${day} às ${hour} - Intensidade: ${intensity}/10 (${dataPoint?.count || 0} reservas)`}
                        >
                          {intensity >= 9 && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          )}
                          {dataPoint?.count > 0 && <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100">{dataPoint.count}</span>}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 text-xs font-semibold text-slate-500">
              <span>Menos Ativo</span>
              <div className="flex gap-1">
                {[0, 2, 5, 8, 10].map(v => (
                  <div key={v} className={`w-4 h-4 rounded ${getHeatmapColor(v)}`}></div>
                ))}
              </div>
              <span>Mais Ativo</span>
            </div>
          </div>

          {/* Retention Chart Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-lock text-indigo-500"></i> Desempenho de Retenção
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Comparativo de clientes retidos e recorrentes.</p>
            </div>
            
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.retentionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="current" name="Ano Atual" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                  <Area type="monotone" dataKey="previous" name="Ano Anterior" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPrevious)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>

        {/* Cross Lead Conversion */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-project-diagram text-emerald-500"></i> Funil de Conversão de Lead Cruzado
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Análise de tráfego orgânico versus reservas confirmadas por canal.</p>
            </div>
            <button className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
              Exportar Relatório PDF
            </button>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.leadConversionData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="visualizacoes" name="Visualizações Totais" fill="#e2e8f0" radius={[10, 10, 10, 10]} />
                <Bar dataKey="cliques" name="Início do Contato" fill="#60a5fa" radius={[10, 10, 10, 10]} />
                <Bar dataKey="conversoes" name="Reservas Confirmadas" fill="#10b981" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
}
