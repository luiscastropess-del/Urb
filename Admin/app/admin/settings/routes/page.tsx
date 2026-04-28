"use client";

import { useEffect, useState } from "react";
import { getApiRoutes, upsertApiRoute, deleteApiRoute, toggleApiRouteStatus } from "@/app/actions.routes";
import { Plus, Link as LinkIcon, Save, Trash2, Edit2, Shield, X, Check, Globe } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const COMMON_ROUTES = [
  { name: "PROSPECT_API_SEARCH", url: "http://34.151.205.86:3000/api/search" },
  { name: "PROSPECT_API_RESULT", url: "http://34.151.205.86:3000/api/result" },
];

export default function ApiRoutesSettingsPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRoutes = async () => {
    try {
      const data = await getApiRoutes();
      setRoutes(data);
    } catch (error) {
      showToast("Erro ao carregar configurações de Links de Rota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleOpenModal = (routeToEdit?: any) => {
    if (routeToEdit) {
      setEditingRoute(routeToEdit);
      setName(routeToEdit.name);
      setUrl(routeToEdit.url);
      setMethod(routeToEdit.method || "GET");
      setDescription(routeToEdit.description || "");
      setIsActive(routeToEdit.isActive);
    } else {
      setEditingRoute(null);
      setName("");
      setUrl("");
      setMethod("GET");
      setDescription("");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !url) {
      showToast("Nome e URL são obrigatórios!");
      return;
    }

    setIsSaving(true);
    try {
      await upsertApiRoute({
        name: name.toUpperCase().trim(),
        url: url.trim(),
        method,
        description: description.trim(),
        isActive
      });
      showToast("Rota salva com sucesso!");
      setIsModalOpen(false);
      loadRoutes();
    } catch (error: any) {
      showToast(error.message || "Erro ao salvar rota.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta rota? Funcionalidades do sistema podem parar de funcionar.")) return;

    try {
      await deleteApiRoute(id);
      showToast("Rota excluída.");
      loadRoutes();
    } catch (error) {
       showToast("Erro ao excluir rota.");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleApiRouteStatus(id, !currentStatus);
      showToast("Status atualizado.");
      loadRoutes();
    } catch (error) {
      showToast("Erro ao atualizar status.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;
  }

  return (
    <div className="pt-24 p-6 md:p-8 max-w-5xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="text-orange-500" /> Links de Rota (Endpoints)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os URLs e webhooks utilizados no sistema (N8n, Make, Custom APIs, etc).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 dark:bg-orange-500 hover:bg-slate-800 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition"
        >
          <Plus size={18} /> Adicionar Rota
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <LinkIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-4 h-16 w-16" />
          <h3 className="text-lg font-bold mb-2">Nenhuma rota configurada</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Você ainda não configurou nenhum webhook ou endpoint dinâmico.
          </p>
          <button
            onClick={() => handleOpenModal({ name: "PROSPECT_API", method: "GET" })}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2"
          >
            Configurar a Primeira Rota
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {routes.map((r) => (
            <div key={r.id} className={`bg-white dark:bg-slate-900 border ${r.isActive ? 'border-slate-200 dark:border-slate-800' : 'border-rose-200 dark:border-rose-900/50'} rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition overflow-hidden`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full ${r.isActive ? 'bg-green-500' : 'bg-rose-500'}`} title={r.isActive ? 'Ativa' : 'Inativa'}></span>
                  <h3 className="font-bold text-lg">{r.name}</h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">{r.method}</span>
                </div>
                
                <div className="mt-2">
                  <code className="text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded text-blue-500 dark:text-blue-400 break-all select-all block border border-slate-100 dark:border-slate-700">
                    {r.url}
                  </code>
                </div>
                
                {r.description && (
                  <p className="text-sm text-slate-500 mt-2">{r.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                 <button 
                   onClick={() => handleToggleStatus(r.id, r.isActive)}
                   className={`px-3 py-1.5 rounded-lg text-sm font-medium ${r.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50' : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50'}`}
                 >
                   {r.isActive ? 'Desativar' : 'Ativar'}
                 </button>
                 <button 
                   onClick={() => handleOpenModal(r)}
                   className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                   title="Editar"
                 >
                   <Edit2 size={16} className="text-slate-600 dark:text-slate-400" />
                 </button>
                 <button 
                   onClick={() => handleDelete(r.id)}
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
                <Globe size={20} className="text-orange-500" /> 
                {editingRoute ? 'Editar Rota' : 'Nova Rota de API'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1.5">Identificador (Nome da Rota)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_ROUTES.map(p => (
                    <button 
                      key={p.name} 
                      onClick={() => { setName(p.name); if(!url) setUrl(p.url); }}
                      className={`text-[10px] px-2 py-1 rounded-full font-medium ${name.toUpperCase() === p.name ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ex: PROSPECT_API"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono text-sm"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="block text-sm font-bold mb-1.5">Método</label>
                  <select 
                    value={method} 
                    onChange={e => setMethod(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="w-2/3">
                  <label className="block text-sm font-bold mb-1.5">Endpoint URL</label>
                  <input 
                    type="url" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    placeholder="https://..."
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Descrição (opcional)</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Ex: Endpoint Make.com para importar places"
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
                <span className="text-sm font-medium">Rota Ativa no Sistema</span>
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
                Salvar Rota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
