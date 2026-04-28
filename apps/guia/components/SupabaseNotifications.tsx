'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './ToastProvider';

export function SupabaseNotifications() {
  const { showToast } = useToast();

  useEffect(() => {
    if (!supabase) return;

    // Conectar ao Supabase Realtime usando Canais de Broadcast
    const channel = supabase.channel('system-notifications');

    channel
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => {
          // Quando receber um broadcast de notificação, exibir no Toast
          if (payload.payload && payload.payload.message) {
            showToast(payload.payload.message);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔗 Conectado ao Supabase Realtime (Notificações)');
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [showToast]);

  return null; // Este componente não renderiza nada na tela
}
