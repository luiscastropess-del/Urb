"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { Compass, Mail, Lock, Eye, EyeOff, User, ArrowRight, UserPlus } from "lucide-react";
import { loginUser, registerUser } from "@/app/actions.auth";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmParam, setRegisterConfirmParam] = useState("");

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
          router.push("/profile");
        }, 1000);
      } else {
        showToast(`⚠️ ${res.error}`);
      }
    } catch (e) {
      showToast("⚠️ Erro ao fazer login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmParam) {
      showToast("⚠️ Preencha todos os campos");
      return;
    }
    if (!registerEmail.includes("@")) {
      showToast("⚠️ E-mail inválido");
      return;
    }
    if (registerPassword.length < 6) {
      showToast("⚠️ A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (registerPassword !== registerConfirmParam) {
      showToast("⚠️ As senhas não coincidem");
      return;
    }

    try {
      const res = await registerUser({ name: registerName, email: registerEmail, password: registerPassword });
      if (res.success) {
        showToast("✅ Conta criada com sucesso!");
        setTimeout(() => {
          showToast("🔐 Agora faça login com sua conta");
          setTab("login"); // Muda para a aba de login como solicitado
          // Limpa campos de registro
          setRegisterName("");
          setRegisterEmail("");
          setRegisterPassword("");
          setRegisterConfirmParam("");
          // Preenche o email no login para facilitar
          setLoginEmail(registerEmail);
        }, 1500);
      } else {
        showToast(`⚠️ ${res.error}`);
      }
    } catch (e) {
      showToast("⚠️ Erro ao criar conta");
    }
  };

  const continueAsGuest = () => {
    showToast("👀 Modo visitante · Funcionalidades limitadas");
    router.push("/explore");
  };

  return (
    <div className="max-w-md mx-auto relative min-h-screen flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto transition-colors">
      {/* Background decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[#f97316] to-[#22c55e] opacity-10"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-green-200 opacity-20 blur-3xl"></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6">
        
        {/* Logo e boas-vindas */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#22c55e] items-center justify-center shadow-lg mb-4">
            <Compass className="text-white text-3xl h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Urbano</h2>
          <p className="text-sm text-slate-500">Holambra · Cidade das Flores 🌷</p>
        </div>
        
        {/* Abas Login / Cadastro */}
        <div className="flex justify-center gap-8 mb-6">
          <button 
            className={`pb-2.5 font-bold text-lg border-b-3 transition-all ${tab === "login" ? "text-[#f97316] border-[#f97316]" : "text-slate-500 border-transparent hover:text-slate-600"}`}
            onClick={() => setTab("login")}
          >
            Entrar
          </button>
          <button 
            className={`pb-2.5 font-bold text-lg border-b-3 transition-all ${tab === "register" ? "text-[#f97316] border-[#f97316]" : "text-slate-500 border-transparent hover:text-slate-600"}`}
            onClick={() => setTab("register")}
          >
            Criar conta
          </button>
        </div>
        
        {/* ========== FORMULÁRIO DE LOGIN ========== */}
        {tab === "login" && (
          <form id="loginForm" onSubmit={handleLogin} className="animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">E-MAIL</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" 
                          className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                  </div>
                </div>
                
                {/* Senha */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">SENHA</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" 
                          className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-3.5 pl-11 pr-11 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Opções extras */}
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" className="accent-[#f97316] w-4 h-4 rounded" /> Lembrar-me
                  </label>
                  <button type="button" onClick={() => showToast('📧 Link enviado para seu e-mail')} className="text-sm text-[#f97316] font-bold hover:underline">Esqueceu a senha?</button>
                </div>
                
                {/* Botão de login */}
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#f97316] to-[#22c55e] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 mt-4 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]">
                  Entrar <ArrowRight className="h-4 w-4" />
                </button>

                {/* Separador */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/80 dark:bg-slate-800 px-3 text-slate-500 font-bold rounded-full backdrop-blur-sm">ou continue com</span>
                  </div>
                </div>

                {/* Login social */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button type="button" className="py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50" onClick={() => showToast('🔐 Login com Google')}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg> Google
                  </button>
                  <button type="button" className="py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50" onClick={() => showToast('🔐 Login com Facebook')}>
                    <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.938 5.858-5.938 1.464 0 2.954.242 2.954.242v3.02h-1.638c-1.559 0-2.01.996-2.01 2.095v1.89h3.535l-.656 3.667h-2.879v7.98h-5.164z"/>
                    </svg> Facebook
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-slate-500 mt-6 pb-2 font-medium">
              Não tem uma conta?{' '}
              <button type="button" className="text-orange-500 font-bold cursor-pointer hover:underline" onClick={() => setTab("register")}>Cadastre-se</button>
            </p>
          </form>
        )}
        
        {/* ========== FORMULÁRIO DE CADASTRO ========== */}
        {tab === "register" && (
          <form id="registerForm" onSubmit={handleRegister} className="animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="space-y-4">
                {/* Nome completo */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">NOME COMPLETO</label>
                  <div className="relative mt-1">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} placeholder="Seu nome" 
                          className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">E-MAIL</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="seu@email.com" 
                          className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                  </div>
                </div>
                
                {/* Senha */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">SENHA</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input type={showPassword ? "text" : "password"} value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="Mínimo 6 caracteres" 
                          className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-3.5 pl-11 pr-11 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Confirmar senha */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 ml-1">CONFIRMAR SENHA</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input type={showConfirmPassword ? "text" : "password"} value={registerConfirmParam} onChange={e => setRegisterConfirmParam(e.target.value)} placeholder="Repita a senha" 
                          className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-2xl py-3.5 pl-11 pr-11 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all" />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Aceitar termos */}
                <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 mt-2 ml-1 leading-snug">
                  <input type="checkbox" className="accent-[#f97316] mt-1 shrink-0 w-4 h-4 rounded" required /> 
                  <span>Concordo com os <button type="button" className="text-orange-500 font-bold hover:underline" onClick={() => showToast('📋 Termos de uso')}>Termos de Uso</button> e <button type="button" className="text-orange-500 font-bold hover:underline" onClick={() => showToast('🔒 Política de Privacidade')}>Política de Privacidade</button>.</span>
                </label>
                
                {/* Botão de cadastro */}
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#f97316] to-[#22c55e] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 mt-4 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]">
                  Criar conta <UserPlus className="h-4 w-4" />
                </button>

                {/* Separador */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/80 dark:bg-slate-800 px-3 text-slate-500 font-bold rounded-full backdrop-blur-sm">ou cadastre-se com</span>
                  </div>
                </div>

                {/* Cadastro social */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button type="button" className="py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50" onClick={() => showToast('🔐 Cadastro com Google')}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg> Google
                  </button>
                  <button type="button" className="py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50" onClick={() => showToast('🔐 Cadastro com Facebook')}>
                    <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.938 5.858-5.938 1.464 0 2.954.242 2.954.242v3.02h-1.638c-1.559 0-2.01.996-2.01 2.095v1.89h3.535l-.656 3.667h-2.879v7.98h-5.164z"/>
                    </svg> Facebook
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-slate-500 mt-6 pb-2 font-medium">
              Já tem uma conta?{' '}
              <button type="button" className="text-orange-500 font-bold cursor-pointer hover:underline" onClick={() => setTab("login")}>Faça login</button>
            </p>
          </form>
        )}
        
        {/* Visitante */}
        <div className="flex justify-center mt-4">
          <button type="button" onClick={continueAsGuest} className="text-sm text-slate-400 font-bold flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200 transition">
            Continuar como visitante <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        
      </div>
    </div>
  );
}
