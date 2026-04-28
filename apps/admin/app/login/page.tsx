"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginUser } from "@/app/actions.auth";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("⚠️ Preencha todos os campos");
      return;
    }
    if (!loginEmail.includes("@")) {
      showToast("⚠️ E-mail inválido");
      return;
    }

    try {
      const res = await loginUser({ email: loginEmail, password: loginPassword });
      if (res.success) {
        showToast("🔓 Login realizado com sucesso!");
        setTimeout(() => {
          showToast("🌷 Bem-vindo de volta!");
          const searchParams = new URLSearchParams(window.location.search);
          const redirect = searchParams.get("redirect") || "/admin";
          router.push(redirect);
        }, 1000);
      } else {
        showToast(`⚠️ ${res.error}`);
      }
    } catch (e) {
      showToast("⚠️ Erro ao fazer login");
    }
  };

  return (
    <div className="max-w-md mx-auto relative h-screen flex flex-col bg-slate-50 dark:bg-slate-950 shadow-2xl overflow-hidden transition-colors">
      {/* Background decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-blue-500 to-orange-500 opacity-10"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6">
        
        {/* Logo e boas-vindas */}
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 items-center justify-center shadow-lg mb-4">
             <div className="text-white font-black text-2xl tracking-tighter">CV</div>
          </div>
          <h2 className="text-2xl font-bold">City Ventures</h2>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold text-[10px]">Passeios e Eventos Divertidos!</p>
        </div>
        
        {/* ========== FORMULÁRIO DE LOGIN ========== */}
        <form id="loginForm" onSubmit={handleLogin} className="animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-500 ml-1">E-MAIL</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@email.com" 
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                </div>
              </div>
              
              {/* Senha */}
              <div>
                <label className="text-xs font-semibold text-slate-500 ml-1">SENHA</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" 
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-11 pr-11 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Opções extras */}
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input type="checkbox" className="accent-[#f97316] w-4 h-4 rounded" /> Lembrar-me
                </label>
                <button type="button" onClick={() => showToast('📧 Link de recuperação enviado para o administrador principal')} className="text-sm text-[#f97316] font-bold hover:underline">Esqueceu a senha?</button>
              </div>
              
              {/* Botão de login */}
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 mt-6 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]">
                Acessar Painel <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
        
        {/* Visitante */}
        <div className="flex justify-center mt-6">
          <p className="text-sm text-slate-400 font-medium flex items-center gap-1 opacity-60">
            <Lock className="h-3 w-3" /> Acesso restrito
          </p>
        </div>
        
      </div>
    </div>
  );
}
