"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getUsers, updateUserRole } from "@/app/actions.admin.users";
import { Users, ShieldAlert, Mail, Calendar, Search } from "lucide-react";
import Image from "next/image";

export default function AdminsPage() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    setLoading(true);
    const res = await getUsers();
    if (res.success) {
      setAdmins((res.users || []).filter((u: any) => u.role === "admin"));
    } else {
      showToast("⚠️ Erro: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className="pt-24 px-5 pb-10 max-w-7xl mx-auto feed-scroll h-screen overflow-y-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="text-purple-500" />
          Administradores
        </h1>
        <p className="text-slate-500 mt-1">Lista de todos os usuários com privilégios administrativos no sistema.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Administrador</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Membro desde</th>
                <th className="px-6 py-4 font-semibold">Cargo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400">Carregando administradores...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400">Nenhum administrador encontrado.</td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                          {admin.avatar ? (
                            <Image src={admin.avatar} alt={admin.name} fill className="object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">{admin.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-bold">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                        {admin.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
