import { NextResponse } from 'next/server';
import { searchOverpass, savePlacesToDb } from '@/lib/prospector-api';
import { setResultBuffer } from '@/lib/prospector-buffer';

export async function POST(req: Request) {
  try {
    const { city, category } = await req.json();

    if (!city || !category) {
      return NextResponse.json({ error: "Cidade e categoria são obrigatórios" }, { status: 400 });
    }

    // 1. Buscar no OSM (30 melhores)
    const results = await searchOverpass(city, category);

    if (results.length === 0) {
      return NextResponse.json({ message: "Nenhum local encontrado", places: [] });
    }

    // 2. Salvar no SQLite (Evitar duplicatas usando osm_id)
    await savePlacesToDb(results);

    // 3. Substituir o conteúdo de /api/result com este novo array
    setResultBuffer(results);

    return NextResponse.json({ 
      message: `${results.length} locais prospectados e salvos com sucesso!`,
      places: results 
    });
  } catch (error: any) {
    console.error("Erro na busca do prospector:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
