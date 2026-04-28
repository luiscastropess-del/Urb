'use client';

import { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead } from '@/app/actions.notifications';
import { getUserSession } from '@/app/actions.auth';
import { Bell } from 'lucide-react';
import { useToast } from "@/components/ToastProvider";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadNotifications() {
      try {
        const user = await getUserSession();
        if (user) {
          const data = await getUserNotifications(user.id);
          setNotifications(data);
        }
      } catch (e: any) {
        showToast("Erro ao carregar notificações.");
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [showToast]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) return <div className="p-6">Carregando notificações...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notificações</h2>
      {notifications.length === 0 ? (
        <p>Nenhuma notificação encontrada.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-lg flex items-start gap-4 ${n.read ? 'bg-gray-100' : 'bg-white border'}`}>
              <Bell className={n.read ? 'text-gray-400' : 'text-blue-500'} />
              <div className="flex-grow">
                <h3 className="font-semibold">{n.title}</h3>
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              {!n.read && (
                <button onClick={() => handleMarkAsRead(n.id)} className="text-sm text-blue-600">Marcar como lida</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
