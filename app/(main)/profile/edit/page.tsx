"use client";

import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Save, User, Mail, Camera, Loader2, BookOpen, Globe, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserSession, updateUserProfile, getGuideProfile } from "@/app/actions.auth";
import Image from "next/image";

export default function EditProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    languages: [] as string[],
    pixKey: ""
  });

  const [langInput, setLangInput] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await getUserSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        setUser(session);
        
        let guideData = null;
        if (session.role === "guide") {
          guideData = await getGuideProfile(session.id);
        }

        setFormData({
          name: session.name || "",
          email: session.email || "",
          avatar: session.avatar || "",
          bio: guideData?.bio || "",
          languages: guideData?.languages || ["Português"],
          pixKey: guideData?.pixKey || ""
        });
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const result = await updateUserProfile(user.id, formData);
      if (result.success) {
        showToast("✅ Perfil atualizado com sucesso!");
        router.push("/profile");
        router.refresh();
      } else {
        showToast(`❌ ${result.error || "Erro ao atualizar perfil"}`);
      }
    } catch (err) {
      showToast("❌ Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = () => {
    if (langInput && !formData.languages.includes(langInput)) {
      setFormData({ ...formData, languages: [...formData.languages, langInput] });
      setLangInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData({ ...formData, languages: formData.languages.filter(l => l !== lang) });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  const isGuide = user?.role === "guide";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Editar Perfil</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="h-28 w-28 rounded-full bg-slate-200 dark:bg-slate-800 p-1 shadow-lg overflow-hidden relative">
                  {formData.avatar ? (
                    <Image 
                      src={formData.avatar} 
                      alt="Preview" 
                      fill 
                      className="object-cover" 
                      onError={() => setFormData({ ...formData, avatar: "" })}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl">👩🏻‍🌾</div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-orange-500 text-white shadow-md flex items-center justify-center border-2 border-white dark:border-slate-900 transition-transform hover:scale-105 active:scale-95">
                  <Camera size={16} />
                </div>
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  showToast("⏳ Enviando imagem...");
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: fd
                    });
                    
                    if (!res.ok) throw new Error("Falha no upload");
                    const data = await res.json();
                    
                    setFormData({ ...formData, avatar: data.url });
                    showToast("✅ Imagem enviada com sucesso!");
                  } catch (err) {
                    showToast("❌ Erro ao enviar imagem");
                    console.error(err);
                  }
                }} 
              />
            </div>
            <p className="text-xs text-slate-500 mt-3">Clique na foto para alterar</p>
          </div>

          {/* Dados Pessoais */}
          <div className="space-y-4 bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Dados Pessoais</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <User size={16} className="text-orange-500" /> Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Mail size={16} className="text-orange-500" /> E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>


          </div>

          {/* Dados do Guia (Condicional) */}
          {isGuide && (
            <div className="space-y-4 bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Perfil de Guia</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <BookOpen size={16} className="text-orange-500" /> Bio / Descrição
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium resize-none"
                  placeholder="Conte um pouco sobre você e sua experiência como guia..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Globe size={16} className="text-orange-500" /> Idiomas
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    placeholder="Ex: Inglês, Holandês"
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages.map((lang) => (
                    <span 
                      key={lang} 
                      className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 group"
                    >
                      {lang}
                      <button 
                        type="button" 
                        onClick={() => removeLanguage(lang)}
                        className="text-orange-400 group-hover:text-orange-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Wallet size={16} className="text-orange-500" /> Chave PIX (para recebimentos)
                </label>
                <input
                  type="text"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  placeholder="Seu PIX"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-3xl bg-orange-500 text-white font-bold text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:bg-orange-600 disabled:opacity-70 disabled:active:scale-100"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="w-full py-4 rounded-3xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm mt-3 border border-slate-100 dark:border-slate-700 shadow-sm transition-all active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
