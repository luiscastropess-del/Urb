import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getApiRouteUrl } from '@/lib/routes';

export async function GET() {
  return await fetchPlaces();
}

// Manter POST para compatibilidade com o botão, mas internamente faremos GET na API externa
export async function POST(req: Request) {
  // Apenas para evitar quebra, faremos o mesmo que o GET
  return await fetchPlaces();
}

async function fetchPlaces() {
  try {
    // Usar a rota PROSPECT_API_PLACES que lista os lugares disponíveis
    const placesRoute = await getApiRouteUrl("PROSPECT_API_PLACES", "https://prospect-urbano.onrender.com/api/places");
    console.log("Buscando places de:", placesRoute);

    const res = await fetch(placesRoute, { 
      cache: "no-store",
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Falha ao buscar locais para mapeamento: ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`Recebidos ${data?.length || 0} lugares da API externa.`);

    if (!Array.isArray(data)) {
      return NextResponse.json({ places: [] });
    }

    // O restante do mapeamento (checar duplicados, formatar) continua igual
    const osmIds = data.map((p: any) => p.osm_id).filter(Boolean);
    
    let importedIds = new Set();
    if (osmIds.length > 0) {
        const existing = await db.place.findMany({
            where: { googlePlaceId: { in: osmIds } },
            select: { googlePlaceId: true }
        });
        importedIds = new Set(existing.map(e => e.googlePlaceId));
    }

    const places = data.map((p: any) => ({
      id: p.osm_id || Math.random().toString(),
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

    console.log(`Retornando ${places.length} lugares processados.`);
    return NextResponse.json({ places });
  } catch (error: any) {
    console.error("Erro fetch places:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
