"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, MapPin, Search, Check, Save, Rocket, Edit2, Shield, Lock, Crown, Image as ImageIcon, Camera, RefreshCw, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { createPlace } from "@/app/actions";

export default function AddPlacePage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    tags: "",
    address: "",
    city: "Holambra",
    state: "SP",
    cep: "",
    phone: "",
    instagram: "",
    website: "",
    email: "",
    plan: "free",
    emoji: "🌻", // Default
    coverImage: "",
    images: [] as string[],
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
        img.src = e.target?.result as string;
      }
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await resizeImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, coverImage: base64 }));
      showToast('📸 Capa atualizada com sucesso');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (formData.images.length + e.target.files.length > 5) {
        showToast('⚠️ Limite de 5 imagens na galeria.');
        return;
      }
      const newImages: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const base64 = await resizeImage(e.target.files[i]);
        newImages.push(base64);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      showToast('🖼️ Galeria atualizada');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (plan: string) => {
    setFormData({ ...formData, plan });
    showToast(`✨ Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} selecionado`);
  };

  const fetchAddressByCep = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({ 
            ...prev, 
            address: `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ''}`,
            city: data.localidade,
            state: data.uf
          }));
          showToast('📍 Endereço preenchido automaticamente');
        } else {
          showToast('⚠️ CEP não encontrado');
        }
      } catch (e) {
        showToast('⚠️ Erro ao buscar CEP');
      }
    } else {
      showToast('⚠️ Digite um CEP válido com 8 dígitos');
    }
  };

  const nextStep = (targetStep: number) => {
    if (step === 1 && (!formData.name || !formData.type || !formData.address || !formData.phone)) {
      showToast('⚠️ Preencha todos os campos obrigatórios (*)');
      return;
    }
    setStep(targetStep);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPlace({
        name: formData.name,
        emoji: formData.emoji,
        type: formData.type,
        description: formData.description,
        tags: formData.tags,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        cep: formData.cep,
        phone: formData.phone,
        instagram: formData.instagram,
        website: formData.website,
        email: formData.email,
        plan: formData.plan,
        coverImage: formData.coverImage,
        images: JSON.stringify(formData.images),
        rating: 5.0,
        reviews: "0",
        distance: "1 km",
        featured: formData.plan === 'premium',
        premium: formData.plan === 'premium' || formData.plan === 'pro',
      });
      showToast('🚀 Local publicado com sucesso!');
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (error) {
      showToast('⚠️ Erro ao salvar o local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative w-full border-x border-slate-200 dark:border-slate-800">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3 pl-12">
          <h1 className="text-xl font-bold">{step === 1 ? 'Adicionar novo local' : step === 2 ? 'Adicionar fotos' : 'Revisar e publicar'}</h1>
        </div>
      </header>

      {/* Área com scroll */}
      <div className="flex-1 overflow-y-auto feed-scroll px-5 pb-24">
        
        {/* Progresso do formulário */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <span className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold cursor-pointer" onClick={() => setStep(1)}>
                <Check size={14} />
              </span>
            ) : (
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-white flex items-center justify-center text-sm font-semibold">1</span>
            )}
            <span className={`text-sm font-medium ${step > 1 ? 'text-green-600' : 'text-slate-800 dark:text-slate-200'}`}>Info</span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step > 1 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          <div className="flex items-center gap-2">
            {step > 2 ? (
              <span className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold cursor-pointer" onClick={() => setStep(2)}>
                <Check size={14} />
              </span>
            ) : step === 2 ? (
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-white flex items-center justify-center text-sm font-semibold">2</span>
            ) : (
              <span className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-sm font-semibold">2</span>
            )}
            <span className={`text-sm ${step === 2 ? 'font-medium' : step > 2 ? 'text-green-600 font-medium' : 'text-slate-400 hidden sm:block'}`}>Fotos</span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step > 2 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          <div className="flex items-center gap-2">
            {step === 3 ? (
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-white flex items-center justify-center text-sm font-semibold">3</span>
            ) : (
              <span className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-sm font-semibold">3</span>
            )}
            <span className={`text-sm ${step === 3 ? 'font-medium' : 'text-slate-400 hidden sm:block'}`}>Publicar</span>
          </div>
        </div>

        {/* --- ETAPA 1: INFORMAÇÕES --- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Seção: Informações básicas */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-4 mb-5 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-orange-500">🏪</span> Informações básicas
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    Nome do estabelecimento <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Café com Flores" 
                         className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" required />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      Categoria <span className="text-rose-500">*</span>
                    </label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" required>
                      <option value="">Selecione</option>
                      <option value="Café">☕ Café</option>
                      <option value="Restaurante">🍽️ Restaurante</option>
                      <option value="Bar">🍸 Bar</option>
                      <option value="Padaria">🥐 Padaria</option>
                      <option value="Sorveteria">🍦 Sorveteria</option>
                      <option value="Parque">🌳 Parque</option>
                      <option value="Museu">🏛️ Museu</option>
                      <option value="Hotel">🏨 Hotel</option>
                      <option value="Outro">📌 Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      Emoji
                    </label>
                    <input type="text" name="emoji" value={formData.emoji} onChange={handleChange} placeholder="🌻" 
                           className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500">Descrição</label>
                  <textarea rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Descreva o local, ambiente, especialidades..." 
                            className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none resize-none"></textarea>
                  <p className="text-[10px] text-slate-400 mt-1 text-right"><span>{formData.description.length}</span>/300</p>
                </div>
              </div>
            </div>
            
            {/* Seção: Localização */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-4 mb-5 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-orange-500" /> Localização
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    Endereço completo <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Rua, número, bairro" 
                         className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" required />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Cidade</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange}
                           className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Estado</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} 
                           className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500">CEP</label>
                  <div className="relative">
                    <input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" 
                           className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 pr-24 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" />
                    <button type="button" onClick={fetchAddressByCep} className="absolute right-3 top-[55%] -translate-y-1/2 text-xs text-orange-500 font-medium">
                      Buscar CEP
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção: Contato */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-4 mb-5 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-orange-500">📞</span> Contato e redes sociais
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    Telefone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(19) 99999-1234" 
                         className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Instagram</label>
                  <div className="relative">
                    <span className="absolute left-3 top-[55%] -translate-y-1/2 text-slate-400">@</span>
                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="cafecomflores" 
                           className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl py-3 pl-8 pr-3 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium text-sm">
                Cancelar
              </button>
              <button onClick={() => nextStep(2)} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-semibold text-sm shadow-md">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* --- ETAPA 2: FOTOS --- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Resumo */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">{formData.emoji || '🏬'}</div>
              <div className="flex-1">
                <h3 className="font-bold text-sm truncate">{formData.name || 'Local sem nome'}</h3>
                <p className="text-xs text-slate-500 truncate">{formData.type || 'Sem categoria'} • Holambra, SP</p>
              </div>
            </div>

            {/* Capa */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 shadow-sm">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-400" /> Foto de capa
              </h3>
              <p className="text-xs text-slate-500 mb-3">Esta será a imagem principal do seu estabelecimento.</p>
              
              <div className="flex gap-4">
                <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl shadow-md relative overflow-hidden" onClick={() => coverInputRef.current?.click()}>
                  {formData.coverImage ? (
                    <img src={formData.coverImage} className="w-full h-full object-cover" />
                  ) : (
                    formData.emoji || '🌷'
                  )}
                  <button type="button" className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs shadow-md">
                    <Edit2 size={10} />
                  </button>
                  <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium">Capa atual</p>
                  <p className="text-xs text-slate-500 mb-1">{formData.coverImage ? 'Personalizada' : 'Gerada automaticamente'}</p>
                  <button type="button" className="text-xs text-orange-500 flex items-center gap-1 w-fit" onClick={() => coverInputRef.current?.click()}>
                    <RefreshCw size={12} /> Trocar imagem
                  </button>
                </div>
              </div>
            </div>

            {/* Adicionar fotos */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 shadow-sm">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-orange-500" /> Galeria
              </h3>
              
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center cursor-pointer transition-colors hover:border-orange-500 hover:bg-orange-500/5" onClick={() => galleryInputRef.current?.click()}>
                <ImageIcon size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Clique para selecionar imagens</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP • Até 5 imagens</p>
                <input type="file" multiple ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleGalleryUpload} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {formData.coverImage ? (
                  <div className="aspect-square rounded-xl relative border-2 border-orange-500 overflow-hidden">
                    <img src={formData.coverImage} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">Capa</span>
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-2xl relative border-2 border-orange-500">
                    {formData.emoji || '🌷'}
                    <span className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">Capa</span>
                  </div>
                )}
                
                {formData.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl relative overflow-hidden group border border-slate-200 dark:border-slate-700">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-rose-500/80 hover:bg-rose-600 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {formData.images.length < 5 && (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors" onClick={() => galleryInputRef.current?.click()}>
                    <span className="text-slate-400 text-xl">+</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                As fotos carregadas aparecerão acima. Limite de 5 imagens.
              </p>
            </div>

            {/* Premium Features */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                  <Crown size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    Tour Virtual 360° 
                    <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Premium</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">Disponível para assinantes Premium. Permite explorar seu espaço virtualmente.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium text-sm">
                Voltar
              </button>
              <button onClick={() => nextStep(3)} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-semibold text-sm shadow-md">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* --- ETAPA 3: REVISAR E PUBLICAR --- */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Mensagem principal */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-4 mb-5 border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600">
                  <Check size={20} />
                </div>
                <div>
                  <p className="font-bold text-green-700 dark:text-green-400">Quase lá! 🎉</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Revise as informações, selecione o plano e publique seu local.</p>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span className="text-orange-500">📋</span> Resumo do local
                </h3>
                <button onClick={() => setStep(1)} className="text-xs text-orange-500 font-medium flex items-center gap-1">
                  <Edit2 size={12} /> Editar
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-2xl shadow-sm border border-white/50">{formData.emoji}</div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-base truncate">{formData.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{formData.type} • Holambra, SP</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div className="flex">
                  <span className="w-20 shrink-0 text-slate-500 text-xs font-medium">Endereço:</span>
                  <span className="flex-1 text-xs truncate">{formData.address}</span>
                </div>
                <div className="flex">
                  <span className="w-20 shrink-0 text-slate-500 text-xs font-medium">Telefone:</span>
                  <span className="flex-1 text-xs truncate">{formData.phone}</span>
                </div>
              </div>
            </div>

            {/* Planos */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Rocket size={16} className="text-orange-500" /> Selecione o plano
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div className={`border-2 rounded-xl p-3 text-center cursor-pointer transition ${formData.plan === 'free' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-slate-200 dark:border-slate-700'}`} 
                     onClick={() => handlePlanSelect('free')}>
                  <span className="font-semibold text-sm block">Free</span>
                  <span className="text-xs text-slate-500">R$ 0</span>
                </div>
                <div className={`border-2 rounded-xl p-3 text-center cursor-pointer transition relative ${formData.plan === 'pro' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-slate-200 dark:border-slate-700'}`} 
                     onClick={() => handlePlanSelect('pro')}>
                  <span className="font-semibold text-sm block text-orange-600 dark:text-orange-500">Pro</span>
                  <span className="text-xs text-slate-500 font-medium">R$ 49/mês</span>
                  <span className="absolute -top-2 inset-x-0 mx-auto w-fit text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">Recomendado</span>
                </div>
                <div className={`border-2 rounded-xl p-3 text-center cursor-pointer transition ${formData.plan === 'premium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700'}`} 
                     onClick={() => handlePlanSelect('premium')}>
                  <span className="font-semibold text-sm block text-amber-600 dark:text-amber-500">Premium</span>
                  <span className="text-xs text-slate-500 font-medium">R$ 99/mês</span>
                </div>
              </div>

              {formData.plan !== 'free' && (
                <div className="mt-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">Resumo da cobrança</span>
                    <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">7 dias grátis</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium border-t border-slate-200 dark:border-slate-700/50 pt-2 mt-1">
                    <span>Total hoje</span>
                    <span className="text-green-600 dark:text-green-400">R$ 0,00</span>
                  </div>
                </div>
              )}
            </div>

            {/* Termos e Configs Privacy */}
            <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Shield size={16} className="text-orange-500" /> Privacidade e Exibição
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Exibir telefone publicamente</span>
                  <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4 cursor-pointer" />
                </label>
                <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Permitir avaliações e reviews</span>
                  <input type="checkbox" defaultChecked className="accent-orange-500 w-4 h-4 cursor-pointer" />
                </label>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mt-2 border border-slate-100 dark:border-slate-700/50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="accent-orange-500 mt-0.5 w-4 h-4 shrink-0" required />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Confirmo que sou proprietário ou representante legal deste estabelecimento e aceito os <span className="text-orange-500 hover:underline">Termos de Uso</span>.
                  </span>
                </label>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-3 mb-6">
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium text-sm transition hover:bg-slate-200">
                Voltar
              </button>
              <button onClick={submitForm} disabled={loading} className="flex-[2] py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Publicando...' : <><Rocket size={16} /> Publicar agora</>}
              </button>
            </div>

          </div>
        )}
        
      </div>
    </div>
  );
}
