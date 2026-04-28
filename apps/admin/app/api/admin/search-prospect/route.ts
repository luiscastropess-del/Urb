import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getApiRouteUrl } from '@/lib/routes';

export async function POST(req: Request) {
  try {
    const { city, category } = await req.json();

    if (city && category) {
      // 1. Aciona a busca na API externa 
      const searchRoute = await getApiRouteUrl("PROSPECT_API_SEARCH", "http://34.151.205.86:3000/api/search");
      
      const searchRes = await fetch(searchRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category })
      });
      // Aguarda o término da busca externa
      if (!searchRes.ok) {
        console.warn("Aviso: Falha ao disparar busca externa na API de prospect", searchRes.statusText);
      }
    }

    return await fetchResults();
  } catch (error: any) {
    console.error("Erro search prospect POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return await fetchResults();
}

async function fetchResults() {
  try {
    // 2. Coleta os resultados da API externa
    const resultRoute = await getApiRouteUrl("PROSPECT_API_RESULT", "http://34.151.205.86:3000/api/result");

    const res = await fetch(resultRoute, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Falha ao buscar na API de prospect: ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!Array.isArray(data)) {
       return NextResponse.json({ places: [] });
    }

    // Identificar quais já foram importados pelo banco
    const osmIds = data.map((p: any) => p.osm_id).filter(Boolean);
    
    let importedIds = new Set();
    if (osmIds.length > 0) {
        const existing = await db.place.findMany({
            where: { googlePlaceId: { in: osmIds } },
            select: { googlePlaceId: true }
        });
        importedIds = new Set(existing.map(e => e.googlePlaceId));
    }

    // Formatar os locais simulando a estrutura que o frontend já usa
    const places = data.map((p: any) => ({
      id: p.osm_id || Math.random().toString(), // usado como key no react e ref
      osm_id: p.osm_id,
      name: p.name,
      address: p.address,
      rating: p.rating ? parseFloat(p.rating) : 0,
      priceLevel: 0,
      reviews: "Fonte: API Externa",
      alreadyImported: p.osm_id ? importedIds.has(p.osm_id) : false,
      photo_url: p.photo_url,
      opening_hours: p.opening_hours,
      phone: p.phone,
      website: p.website,
      category: p.category
    }));

    return NextResponse.json({ places });
  } catch (error: any) {
    console.error("Erro fetch results:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

