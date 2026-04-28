'use client';

import { useState, useEffect } from 'react';
import { getGuideProfile, updateGuideCustomization } from '@/app/actions.guide';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

export default function VipCustomizationPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    customColors: '#f97316', // Orange as default main
    customFont: 'Inter',
    customDomain: '',
    customLogo: '',
    themeStyle: 'modern',
    animationSpeed: 'normal',
    showWhatsapp: true,
    socialInstagram: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getGuideProfile();
        if (res.profile) {
          setProfile(res.profile);
          
          let parsedSettings: any = {};
          if (res.profile.customSettings) {
            try {
              parsedSettings = JSON.parse(res.profile.customSettings);
            } catch(e) {}
          }

          setFormData({
            customColors: res.profile.customColors || '#f97316',
            customFont: res.profile.customFont || 'Inter',
            customDomain: res.profile.customDomain || '',
            customLogo: parsedSettings.customLogo || '',
            themeStyle: parsedSettings.themeStyle || 'modern',
            animationSpeed: parsedSettings.animationSpeed || 'normal',
            showWhatsapp: parsedSettings.showWhatsapp !== undefined ? parsedSettings.showWhatsapp : true,
            socialInstagram: parsedSettings.socialInstagram || '',
          });
        }
      } catch (error) {
        showToast('Erro ao carregar perfil.');
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customSettings = JSON.stringify({
        customLogo: formData.customLogo,
        themeStyle: formData.themeStyle,
        animationSpeed: formData.animationSpeed,
        showWhatsapp: formData.showWhatsapp,
        socialInstagram: formData.socialInstagram,
      });

      await updateGuideCustomization({
        customColors: formData.customColors,
        customFont: formData.customFont,
        customDomain: formData.customDomain,
        customSettings,
      });
      showToast('✅ Configurações VIP salvas com sucesso!');
    } catch (error) {
      showToast('❌ Erro ao salvar personalização.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-orange-500"></i>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Perfil não encontrado. Por favor, faça login.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* Header (Dashboard Style) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/guia" className="h-10 w-10 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full flex items-center justify-center text-slate-600">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <i className="fas fa-crown text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Personalização VIP</h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Construtor de Marca</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200 rounded-full text-orange-700 text-xs font-black uppercase tracking-widest shadow-inner">
          <i className="fas fa-gem"></i> Conta Diamond
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Area */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seção de Cores e Estilo */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
                    <i className="fas fa-palette"></i>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-800">Identidade Visual</h2>
                    <p className="text-xs text-slate-500">Defina as cores e o layout principal.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cor Principal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cor de Destaque</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="relative cursor-pointer shrink-0">
                        <input
                          type="color"
                          value={formData.customColors}
                          onChange={(e) => setFormData({...formData, customColors: e.target.value})}
                          className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent appearance-none"
                        />
                        <div 
                          className="absolute inset-0 rounded-lg pointer-events-none border-2 border-white shadow-sm"
                          style={{ backgroundColor: formData.customColors }}
                        ></div>
                      </label>
                      <input 
                        type="text" 
                        value={formData.customColors}
                        onChange={(e) => setFormData({...formData, customColors: e.target.value})}
                        className="flex-1 bg-transparent font-mono font-bold text-slate-700 uppercase outline-none"
                      />
                    </div>
                  </div>

                  {/* Estilo do Tema */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Estilo do Tema</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fas fa-layer-group"></i>
                      </div>
                      <select 
                        value={formData.themeStyle}
                        onChange={(e) => setFormData({...formData, themeStyle: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                      >
                        <option value="modern">Moderno (Cantos arredondados)</option>
                        <option value="elegant">Elegante (Clássico Premium)</option>
                        <option value="bold">Ousado (Cores Sólidas)</option>
                        <option value="minimal">Minimalista (Bordas Finas)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Tipografia */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                  <i className="fas fa-font"></i>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">Tipografia Premium</h2>
                  <p className="text-xs text-slate-500">Escolha a fonte que mais combina com você.</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'Inter', label: 'Inter', type: 'Limpo' },
                  { id: 'Space Grotesk', label: 'Space', type: 'Tech' },
                  { id: 'Playfair Display', label: 'Serif', type: 'Classico' },
                  { id: 'Outfit', label: 'Outfit', type: 'Suave' },
                ].map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setFormData({...formData, customFont: font.id})}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between h-24 transition-all ${
                      formData.customFont === font.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400">{font.type}</span>
                    <span className="text-lg font-bold text-slate-800" style={{ fontFamily: font.id }}>
                      {font.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seção de Domínio e Redes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <i className="fas fa-globe"></i>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">Presença Online</h2>
                  <p className="text-xs text-slate-500">Seu domínio e conexões sociais.</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Domínio Próprio</label>
                  <div className="flex relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <i className="fas fa-link"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="ex: guia-maria.com.br"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({...formData, customDomain: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Logo Customizada (URL)</label>
                    <div className="flex relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fas fa-image"></i>
                      </div>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={formData.customLogo}
                        onChange={(e) => setFormData({...formData, customLogo: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Instagram (Usuário)</label>
                    <div className="flex relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fab fa-instagram"></i>
                      </div>
                      <input
                        type="text"
                        placeholder="@seuperfil"
                        value={formData.socialInstagram}
                        onChange={(e) => setFormData({...formData, socialInstagram: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <i className="fab fa-whatsapp"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-800">Botão Flutuante do WhatsApp</p>
                      <p className="text-[10px] text-green-600">Mostra o botão de chat rápido no seu site VIP.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.showWhatsapp} 
                      onChange={(e) => setFormData({...formData, showWhatsapp: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin text-xl"></i>
              ) : (
                <>
                  <i className="fas fa-save text-xl"></i>
                  Salvar Personalização Completa
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Area */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="sticky top-28 bg-transparent">
            
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider"><i className="fas fa-mobile-alt mr-2"></i> Pré-visualização Móbile</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold animate-pulse">Ao Vivo</span>
            </div>

            <div className="mx-auto w-[320px] h-[650px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl relative border-8 border-slate-800">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
              
              {/* Screen */}
              <div 
                className={`w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden relative flex flex-col`}
                style={{ fontFamily: formData.customFont }}
              >
                
                {/* Header Mockup */}
                <div 
                  className={`h-40 relative px-6 flex flex-col justify-end pb-6 text-white`} 
                  style={{ backgroundColor: formData.customColors }}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      {formData.customLogo ? (
                        <div className="w-12 h-12 bg-white rounded-full mb-3 p-1 shrink-0 overflow-hidden shadow-lg">
                          <img src={formData.customLogo} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-white/20 rounded-full mb-3 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                          <i className="fas fa-user text-xl"></i>
                        </div>
                      )}
                      <h3 className="font-bold text-lg leading-tight drop-shadow-md">{profile.name}</h3>
                      <p className="text-[10px] font-medium opacity-90"><i className="fas fa-map-marker-alt"></i> Guia Oficial</p>
                    </div>
                    {formData.socialInstagram && (
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white text-xs mb-1">
                        <i className="fab fa-instagram"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Mockup */}
                <div className="flex-1 p-5 space-y-5 overflow-hidden">
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md transition-all`}
                      style={{ 
                        backgroundColor: formData.customColors,
                        borderRadius: formData.themeStyle === 'modern' ? '12px' : formData.themeStyle === 'minimal' ? '4px' : formData.themeStyle === 'elegant' ? '24px' : '0px'
                      }}
                    >
                      <i className="fas fa-calendar-check mr-2"></i> Reservar
                    </div>
                    <div 
                      className="h-12 border-2 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ 
                        borderColor: formData.customColors, color: formData.customColors,
                        borderRadius: formData.themeStyle === 'modern' ? '12px' : formData.themeStyle === 'minimal' ? '4px' : formData.themeStyle === 'elegant' ? '24px' : '0px'
                      }}
                    >
                      Ver Pacotes
                    </div>
                  </div>

                  {/* Cards Mockup */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase">Em Destaque</p>
                    {[1, 2].map(i => (
                      <div 
                        key={i} 
                        className="p-3 bg-white shadow-sm flex items-center gap-3 border border-slate-100"
                        style={{
                           borderRadius: formData.themeStyle === 'modern' ? '16px' : formData.themeStyle === 'minimal' ? '6px' : formData.themeStyle === 'elegant' ? '20px' : '2px'
                        }}
                      >
                        <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-3 w-3/4 bg-slate-200 rounded mb-2"></div>
                          <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Floating WhatsApp Mockup */}
                {formData.showWhatsapp && (
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg shadow-green-500/40">
                    <i className="fab fa-whatsapp"></i>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
