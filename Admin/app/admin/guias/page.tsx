"use client";

import { Suspense, useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getGuides, updateGuideStatus, updateGuideProfileData } from "@/app/actions.admin.guias";
import { getPlans } from "@/app/actions.plans";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert,
  MapPin,
  Package,
  Crown,
  Edit,
  X
} from "lucide-react";
import { format } from "date-fns";

function GuiasContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [plans, setPlans] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchGuidesAndPlans = async () => {
    try {
      const [guidesData, plansData] = await Promise.all([
        getGuides(),
        getPlans()
      ]);
      setGuides(guidesData);
      setPlans(plansData);
    } catch (e: any) {
      console.error("DEBUG: Failed to fetch data:", e);
      showToast(e.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidesAndPlans();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!confirm(`Tem certeza que deseja mudar para ${status}?`)) return;
    try {
      await updateGuideStatus(id, status);
      showToast("Status atualizado com sucesso!");
      fetchGuides();
    } catch (e) {
      showToast("Erro ao atualizar status.");
    }
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    try {
      await updateGuideProfileData(editingProfile.id, {
        bio: editForm.bio,
        pixKey: editForm.pixKey,
        plan: editForm.plan,
        commissionRate: parseFloat(editForm.commissionRate) || 0,
      });
      showToast("Perfil atualizado com sucesso!");
      setEditingProfile(null);
      fetchGuidesAndPlans();
    } catch (e: any) {
      showToast(e.message || "Erro ao atualizar perfil.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Aprovado</span>;
      case "PENDING": return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pendente</span>;
      case "REJECTED": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Reprovado</span>;
      case "BLOCKED": return <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1"><ShieldAlert size={12}/> Bloqueado</span>;
      default: return null;
    }
  };

  const filteredGuides = guides.filter(g => 
    g.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    g.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto feed-scroll">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-orange-500" />
            Gerenciamento de Guias
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analise cadastros, ajuste comissões e acompanhe o desempenho dos guias turísticos.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar guia por nome ou email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfil</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comissão</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cadastrado em</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading && <tr><td colSpan={5} className="p-8 text-center text-slate-500"><Clock className="animate-spin inline mr-2" /> Carregando...</td></tr>}
              {!loading && filteredGuides.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum guia encontrado.</td></tr>}
              {!loading && filteredGuides.map(guide => (
                <tr key={guide.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                  <td className="p-4 cursor-pointer" onClick={() => {
                    setEditingProfile(guide);
                    setEditForm({
                      bio: guide.bio || "",
                      pixKey: guide.pixKey || "",
                      plan: guide.user?.plan || "free",
                      commissionRate: guide.commissionRate || 0,
                    });
                  }}>
                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold">
                        {guide.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-sm group-hover:text-amber-500 transition-colors flex items-center gap-1">
                          {guide.user?.name || "Usuário desconhecido"}
                          <Edit size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-slate-500 flex gap-2 items-center mt-1">
                          {guide.user?.email || "Email não disponível"}
                          <span className="flex items-center gap-1 text-sky-500 hover:opacity-80" title="Rotas Cadastradas"><MapPin size={10}/> {guide._count?.routes || 0}</span>
                          <span className="flex items-center gap-1 text-emerald-500 hover:opacity-80" title="Pacotes Vendidos"><Package size={10}/> {guide._count?.packages || 0}</span>
                          {guide.user?.plan && guide.user?.plan !== "free" && (
                            <span className="flex items-center gap-1 text-purple-500" title={`Plano: ${guide.user?.plan}`}><Crown size={10}/> {guide.user.plan}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(guide.status)}
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{(guide.commissionRate * 100)}%</span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {format(new Date(guide.createdAt), "dd/MM/yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {guide.status !== "APPROVED" && (
                         <button 
                            onClick={() => handleUpdateStatus(guide.id, "APPROVED")}
                            className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition"
                          >
                           Aprovar
                         </button>
                       )}
                       {guide.status === "PENDING" && (
                         <button 
                            onClick={() => handleUpdateStatus(guide.id, "REJECTED")}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition"
                          >
                           Reprovar
                         </button>
                       )}
                       {guide.status === "APPROVED" && (
                         <button 
                            onClick={() => handleUpdateStatus(guide.id, "BLOCKED")}
                            className="px-3 py-1 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold transition"
                          >
                           Bloquear
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">Editar Perfil de Guia</h3>
                <p className="text-xs text-slate-500 mt-1">{editingProfile.user?.name} - {editingProfile.user?.email}</p>
              </div>
              <button 
                onClick={() => setEditingProfile(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-2">Plano de Assinatura</label>
                <select
                  value={editForm.plan || "free"}
                  onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3"
                >
                  <option value="free">Gratuito</option>
                  <option value="plus">Plus</option>
                  <option value="premium">Premium</option>
                  <option value="ultimate">Ultimate</option>
                  {plans.filter(p => !["free", "plus", "premium", "ultimate"].includes(p.name.toLowerCase())).map(plan => (
                    <option key={plan.id} value={plan.name.toLowerCase()}>{plan.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Taxa de Comissão (Ex: 0.15 para 15%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={editForm.commissionRate}
                  onChange={(e) => setEditForm({ ...editForm, commissionRate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Chave Pix</label>
                <input
                  type="text"
                  value={editForm.pixKey || ""}
                  onChange={(e) => setEditForm({ ...editForm, pixKey: e.target.value })}
                  placeholder="E-mail, CPF/CNPJ, Telefone ou Chave Aleatória"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Biografia</label>
                <textarea
                  value={editForm.bio || ""}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  placeholder="Uma breve apresentação do guia..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setEditingProfile(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-white dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminGuiasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuiasContent />
    </Suspense>
  );
}
