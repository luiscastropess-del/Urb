'use server';

import { createClient } from '@supabase/supabase-js';

// Usamos client com ANON ou SERVICE_ROLE para enviar notificações do servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Função de conveniência para enviar Notificações Realtime.
 * Você pode chamá-la de qualquer Server Action ou Componente.
 */
export async function sendNotification(message: string) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase Realtime não configurado. Notificação ignorada:', message);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Enviar a notificação como broadcast via canal "system-notifications"
  const channel = supabase.channel('system-notifications');
  await channel.send({
    type: 'broadcast',
    event: 'notification',
    payload: { message },
  });

  supabase.removeChannel(channel);
}
