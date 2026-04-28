"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, BookOpen, Code, Terminal, Zap, FileJson, Key, Trash2, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getDeveloperKeys, generateDeveloperKey, deleteDeveloperKey } from "@/app/actions.apikey";
import { useToast } from "@/components/ToastProvider";
import { API_BASE_URL } from "@/lib/constants";

export default function ApiDocsPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeveloperKeys();
      setKeys(data);
    } catch (e) {
      showToast("❌ Erro ao carregar chaves");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const res = await generateDeveloperKey("Chave do Desenvolvedor");
      if (res.success && res.key) {
        setKeys([res.key, ...keys]);
        showToast("✅ Chave gerada com sucesso!");
      } else {
        showToast(res.error || "❌ Erro ao gerar chave");
      }
    } catch (e) {
      showToast("❌ Erro desconhecido");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Tem certeza que deseja revogar esta chave? Essa ação é irreversível.")) return;
    
    try {
      const res = await deleteDeveloperKey(id);
      if (res.success) {
        setKeys(keys.filter(k => k.id !== id));
        showToast("⚠️ Chave revogada!");
      } else {
        showToast(res.error || "❌ Erro ao revogar chave");
      }
    } catch (e) {
      showToast("❌ Erro desconhecido");
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <Link 
              href="/dashboard/guia/plugins"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <BookOpen className="text-indigo-600" /> API de Plugins
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-10">
            Documentação completa para desenvolvedores criarem módulos e integrações.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateKey}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
          >
            {generating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : (
              <Terminal size={18} />
            )}
            Gerar Chave de API
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Nav (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 space-y-1">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Menu</h3>
            <ul className="space-y-1 text-sm font-medium">
              <li>
                <a href="#intro" className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Introdução</a>
              </li>
              <li>
                <a href="#keys" className="block px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700">Minhas Chaves</a>
              </li>
              <li>
                <a href="#auth" className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Autenticação</a>
              </li>
              <li>
                <a href="#endpoints" className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Endpoints Base</a>
              </li>
              <li>
                <a href="#manifest" className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">Manifesto (JSON)</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          
          <div id="intro" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">1. Introdução</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
              <p className="mb-4">
                A API de Módulos permite que você estenda as funcionalidades nativas do seu painel e crie integrações completas com serviços de terceiros. Você pode adicionar visualizações, sincronizar ferramentas de CRM, ou criar prospecções específicas usando a nossa infraestrutura.
              </p>
              <p>
                Nossa API é RESTful, retorna payloads em JSON e utiliza códigos de status HTTP padrão.
              </p>
            </div>
          </div>

          <div id="keys" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Key size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">2. Minhas Chaves de API</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2 mb-4"></div>
                </div>
              ) : keys.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Key size={32} className="mx-auto mb-3 text-slate-300" />
                  <p>Nenhuma chave de API gerada.</p>
                  <p className="text-sm mt-1">Crie uma nova chave usando o botão no topo da página.</p>
                </div>
              ) : (
                keys.map((key) => (
                  <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm mb-1">{key.name}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded truncate flex-1 md:flex-none">
                          {key.key}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(key.id, key.key)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                          title="Copiar Chave"
                        >
                          {copiedId === key.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Criada em {new Date(key.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                      <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">Ativa</span>
                      <button 
                        onClick={() => handleDeleteKey(key.id)}
                        className="mt-2 text-xs flex items-center gap-1 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} /> Revogar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="auth" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                <Code size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">3. Autenticação</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
              <p className="mb-4">
                Todas as requisições para a API precisam ser autenticadas via header <code>Authorization</code> usando um Bearer token local.
              </p>
              <div className="bg-slate-900 rounded-xl p-4 my-4 overflow-x-auto">
                <pre className="text-emerald-400 font-mono text-xs">
                  {`curl -X GET "${API_BASE_URL}/api/v1/plugins/status" \\
  -H "Authorization: Bearer seu_token_aqui"`}
                </pre>
              </div>
            </div>
          </div>

          <div id="endpoints" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">4. Endpoints Base</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
              <p className="mb-4">
                O sistema está dividido em três aplicações principais. Dependendo do tipo de integração que você está construindo, você deve apontar para o Endpoint Base correspondente:
              </p>
              
              <div className="space-y-4 my-6">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-base mb-1">App Guias Locais (Painel Principal)</h3>
                  <code className="text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg block w-full truncate">{API_BASE_URL}</code>
                  <p className="text-xs text-slate-500 mt-2">Use este endpoint para integrações relacionadas a gestão de roteiros, prospector e plugins de guias.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-base mb-1">App Clientes</h3>
                  <code className="text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg block w-full truncate">https://guia-urbano.onrender.com</code>
                  <p className="text-xs text-slate-500 mt-2">Use este endpoint para integrações focadas na experiência do usuário final, reservas e visualização de pacotes.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-base mb-1">App Admin</h3>
                  <code className="text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg block w-full truncate">https://adm-urbano.onrender.com/</code>
                  <p className="text-xs text-slate-500 mt-2">Use estritamente para integrações de nível gerencial superior do sistema.</p>
                </div>
              </div>
            </div>
          </div>

          <div id="manifest" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <FileJson size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">5. Formato do Manifesto</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
              <p className="mb-4">
                Ao registrar um novo plugin, você deve fornecer um objeto <code>manifest</code> na resposta inicial. Isso define como o plugin aparecerá na aba &quot;Módulos &amp; Plugins&quot;.
              </p>
              <div className="bg-slate-900 rounded-xl p-4 my-4 overflow-x-auto">
                <pre className="text-blue-300 font-mono text-xs">
{`{
  "name": "Meu Módulo Inteligente",
  "slug": "meu-modulo-inteligente",
  "version": "1.0.0",
  "description": "Uma integração com ferramentas externas.",
  "author": "Guia Tech",
  "icon": "Zap", // Use lucide-react names
  "color": "indigo", // Available: purple, blue, green, orange, indigo, rose
  "permissions": ["read_places", "write_places"]
}`}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
