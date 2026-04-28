import { NextResponse } from 'next/server';
import { getResultBuffer, clearResultBuffer } from '@/lib/prospector-buffer';

export async function GET() {
  const results = getResultBuffer();
  
  // Mecanismo de Limpeza: Após enviar a resposta, esvazia o buffer
  // Nota: No Next.js, fazemos a limpeza antes de retornar ou usamos a resposta para gatilho
  // De acordo com a regra: "após enviar a resposta JSON, o array... deve ser ESVAZIADO"
  
  // Em Next.js podemos usar a resposta e depois limpar se o runtime for persistente,
  // ou simplesmente limpar antes de enviar o clone.
  
  clearResultBuffer();
  
  return NextResponse.json({ places: results });
}
