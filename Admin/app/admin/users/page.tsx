"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getUsers, updateUserRole, deleteUser } from "@/app/actions.admin.users";
import { 
  Users, Trash2, Edit2, Search, Mail, Shield, ShieldAlert, User as UserIcon, UserCheck, Calendar, Star
} from "lucide-react";
import Image from "next/image";

export default function UserListPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("user");

  const loadUsers = async () => {
    setLoading(true);
    console.log("Fetching users...");
    try {
      const res = await getUsers();
      console.log("Users response:", res);
      if (res.success) {
        setUsers(res.users || []);
      } else {
        showToast("⚠️ Erro ao carregar usuários: " + res.error);
      }
    } catch (err: any) {
      console.error("Critical error in loadUsers:", err);
      showToast("⚠️ Erro crítico: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (id: string) => {
    const res = await updateUserRole(id, editRole);
    if (res.success) {
      showToast("✅ Cargo atualizado com sucesso");
      setEditingId(null);
      loadUsers();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este usuário?")) return;
    const res = await deleteUser(id);
    if (res.success) {
      showToast("🗑️ Usuário excluído");
      loadUsers();
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
  };

  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const name = u.name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const role = u.role?.toLowerCase() || "";
    const s = search.toLowerCase();
    return name.includes(s) || email.includes(s) || role.includes(s);
  });

  return (
    <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll min-h-screen w-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-blue-500" />
            Lista de Usuários ({users.length})
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-wider">Gestão de Contas e Cargos</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou cargo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-4" role="status"></div>
            <p>Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <UserIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isEditing = editingId === user.id;

            return (
              <div key={user.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative border-2 border-white dark:border-slate-700 shadow-sm">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-slate-400">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Cargo:</span>
                      {isEditing ? (
                        <select 
                          value={editRole} 
                          onChange={e => setEditRole(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-[10px]"
                        >
                          <option value="user">Usuário</option>
                          <option value="guide">Guia</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'guide' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' && <ShieldAlert size={10} />}
                          {user.role === 'guide' && <Shield size={10} />}
                          {user.role === 'user' && <UserIcon size={10} />}
                          {user.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Progresso:</span>
                      <span className="font-mono text-[10px] font-bold flex items-center gap-1 text-orange-500">
                        <Star size={10} fill="currentColor" /> Lvl {user.level} ({user.xp} XP)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Membro desde:</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-700"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleUpdateRole(user.id)} 
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        Salvar Cargo
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingId(user.id);
                          setEditRole(user.role);
                        }}
                        className="p-1 px-2 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 rounded transition flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Edit2 size={12} /> Alterar Cargo
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded transition flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Trash2 size={12} /> Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
