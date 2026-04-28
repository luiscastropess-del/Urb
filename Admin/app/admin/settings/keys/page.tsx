"use client";

import { useEffect, useState } from "react";
import { getApiKeys, upsertApiKey, deleteApiKey, toggleApiKeyStatus } from "@/app/actions.keys";
import { Plus, KeyRound, Save, Trash2, Edit2, Shield, X, Check, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const COMMON_PROVIDERS = [
  "GOOGLE_MAPS",
  "GEMINI_API",
  "OPENROUTER",
  "PAGDEV", // Modo Desenvolvedor
  "MERCADO_PAGO",
  "AWS_S3",
  "RESEND"
];

export default function ApiKeysSettingsPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<any>(null);

  // Form State
  const [provider, setProvider] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Visibility State
  const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});

  const loadKeys = async () => {
    try {
      const data = await getApiKeys();
      setKeys(data);
    } catch (error) {
      showToast("Erro ao carregar configurações de API Keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleOpenModal = (keyToEdit?: any) => {
    if (keyToEdit) {
      setEditingKey(keyToEdit);
      setProvider(keyToEdit.provider);
      setKeyValue(keyToEdit.key);
      setDescription(keyToEdit.description || "");
      setIsActive(keyToEdit.isActive);
    } else {
      setEditingKey(null);
      setProvider("");
      setKeyValue("");
      setDescription("");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!provider || !keyValue) {
      showToast("Provedor e Chave são obrigatórios!");
      return;
    }

    setIsSaving(true);
    try {
      await upsertApiKey({
        provider: provider.toUpperCase().trim(),
        key: keyValue.trim(),
        description: description.trim(),
        isActive
      });
      showToast("Chave salva com sucesso!");
      setIsModalOpen(false);
      loadKeys();
    } catch (error: any) {
      showToast(error.message || "Erro ao salvar chave.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta chave? APIs dependentes podem parar de funcionar.")) return;

    try {
      await deleteApiKey(id);
      showToast("Chave excluída.");
      loadKeys();
    } catch (error) {
       showToast("Erro ao excluir chave.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleApiKeyStatus(id, !currentStatus);
      showToast("Status atualizado.");
      loadKeys();
    } catch (error) {
      showToast("Erro ao atualizar status.");
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;
  }

  return (
    <div className="pt-24 p-6 md:p-8 max-w-5xl mx-auto h-screen overflow-y-auto w-full feed-scroll">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="text-orange-500" /> API Keys
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie as chaves de integração para serviços externos (Google Maps, OpenAI, Gateway de Pagamento, etc).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition"
        >
          <Plus size={18} /> Adicionar Chave
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <Shield className="mx-auto text-slate-300 dark:text-slate-600 mb-4 h-16 w-16" />
          <h3 className="text-lg font-bold mb-2">Nenhuma chave configurada</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Você ainda não configurou as chaves de API necessárias para o funcionamento dos serviços externos.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2"
          >
            Configurar a Primeira Chave
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {keys.map((k) => (
            <div key={k.id} className={`bg-white dark:bg-slate-900 border ${k.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-rose-200 dark:border-rose-900/50'} rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition overflow-hidden`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full ${k.isActive ? 'bg-green-500' : 'bg-rose-500'}`} title={k.isActive ? 'Ativa' : 'Inativa'}></span>
                  <h3 className="font-bold text-lg">{k.provider}</h3>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-1.5 rounded text-slate-600 dark:text-slate-400 break-all select-all">
                    {visibleKeys[k.id] ? k.key : '••••••••••••••••••••••••••••••••••'}
                  </code>
                  <button onClick={() => toggleVisibility(k.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {visibleKeys[k.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                
                {k.description && (
                  <p className="text-sm text-slate-500 mt-2">{k.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                 <button 
                   onClick={() => handleToggleStatus(k.id, k.isActive)}
                   className={`px-3 py-1.5 rounded-lg text-sm font-medium ${k.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50' : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50'}`}
                 >
                   {k.isActive ? 'Desativar' : 'Ativar'}
                 </button>
                 <button 
                   onClick={() => handleOpenModal(k)}
                   className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                   title="Editar"
                 >
                   <Edit2 size={16} className="text-slate-600 dark:text-slate-400" />
                 </button>
                 <button 
                   onClick={() => handleDelete(k.id)}
                   className="p-2 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 rounded-xl"
                   title="Excluir"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <KeyRound size={20} className="text-orange-500" /> 
                {editingKey ? 'Editar Chave' : 'Nova Chave de API'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1.5">Provedor/Serviço</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_PROVIDERS.map(p => (
                    <button 
                      key={p} 
                      onClick={() => setProvider(p)}
                      className={`text-[10px] px-2 py-1 rounded-full font-medium ${provider.toUpperCase() === p ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={provider} 
                  onChange={e => setProvider(e.target.value)} 
                  placeholder="Ex: API_METEO, GITHUB_TOKEN"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Api Key / Token / Secret</label>
                <input 
                  type="text" 
                  value={keyValue} 
                  onChange={e => setKeyValue(e.target.value)} 
                  placeholder="Sua chave aqui..."
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Descrição (opcional)</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Ex: Usada para geocoding, Token de prod..."
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                />
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" 
                />
                <span className="text-sm font-medium">Chave Ativa</span>
              </label>
            </div>
            
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSaving ? <span className="animate-spin text-lg">↻</span> : <Save size={18} />}
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
