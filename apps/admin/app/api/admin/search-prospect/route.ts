import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';

// Função para buscar locais no OpenStreetMap via Overpass API
async function searchOSM(city: string, category: string): Promise<any[]> {
  // Mapeamento de categoria para tags OSM
  const categoryMap: Record<string, string> = {
    restaurant: 'amenity=restaurant',
    cafe: 'amenity=cafe',
    tourist_attraction: 'tourism=attraction',
    park: 'leisure=park',
    hotel: 'tourism=hotel',
  };

  const osmTag = categoryMap[category] || 'amenity=restaurant';
  
  // Consulta Overpass: busca pela cidade e categoria
  const query = `
    [out:json];
    area["name"="${city}"]["boundary"="administrative"]->.city;
    node(area.city)["${osmTag.split('=')[0]}"="${osmTag.split('=')[1]}"];
    out body;
  `;

  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  const res = await fetch(overpassUrl, {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' }
  });

  if (!res.ok) {
    console.error('Overpass API error:', res.statusText);
    return [];
  }

  const data = await res.json();
  
  // Filtra apenas locais com endereço completo (name + street + city)
  const validPlaces = data.elements.filter((el: any) => 
    el.tags?.name && 
    el.tags?.['addr:street'] && 
    el.tags?.['addr:city']
  );

  // Mapeia para o formato esperado
  return validPlaces.map((el: any) => ({
    osm_id: `osm-${el.id}`,
    name: el.tags.name,
    address: `${el.tags['addr:street']}, ${el.tags['addr:housenumber'] || ''} - ${el.tags['addr:city']}`,
    phone: el.tags.phone || el.tags['contact:phone'] || null,
    website: el.tags.website || el.tags['contact:website'] || null,
    instagram: el.tags['contact:instagram'] || null,
    category: category,
    lat: el.lat,
    lon: el.lon,
    opening_hours: el.tags.opening_hours || null,
  }));
}

// Função para enriquecer com Google Places
async function enrichWithGoogle(place: any, googleApiKey: string) {
  if (!googleApiKey) return place;

  try {
    // Busca o place_id do Google pelo nome e endereço
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(place.name + ' ' + place.address)}&key=${googleApiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.results && searchData.results.length > 0) {
      const googlePlace = searchData.results[0];
      
      // Busca detalhes completos
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlace.place_id}&key=${googleApiKey}&language=pt-BR`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData.result) {
        const d = detailsData.result;
        place.googlePlaceId = d.place_id;
        place.rating = d.rating || 0;
        place.userRatingsTotal = d.user_ratings_total || 0;
        place.priceLevel = d.price_level;
        place.phone = d.formatted_phone_number || place.phone;
        place.website = d.website || place.website;
        place.address = d.formatted_address || place.address;
        place.photos = d.photos?.slice(0, 5).map((p: any) => ({
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${googleApiKey}`,
          googleRef: p.photo_reference
        })) || [];
        place.opening_hours = d.opening_hours?.weekday_text || [];
        place.reviews = d.reviews?.slice(0, 5).map((r: any) => ({
          authorName: r.author_name,
          rating: r.rating,
          text: r.text,
          relativePublishTime: r.relative_time_description
        })) || [];
        place.description = d.editorial_summary?.overview || null;
      }
    }
  } catch (error) {
    console.error('Erro no enriquecimento Google:', error);
  }

  return place;
}

export async function POST(req: Request) {
  try {
    const { city, category } = await req.json();

    if (!city || !category) {
      return NextResponse.json({ error: 'Cidade e categoria são obrigatórias' }, { status: 400 });
    }

    // 1. Busca no OpenStreetMap
    const osmPlaces = await searchOSM(city, category);
    
    if (osmPlaces.length === 0) {
      return NextResponse.json({ places: [], message: 'Nenhum local encontrado com endereço completo' });
    }

    // 2. Tenta pegar a chave do Google Maps do banco
    let googleApiKey: string | undefined;
    try {
      const key = await getProviderKey('GOOGLE_MAPS_API_KEY');
      if (key) googleApiKey = key;
    } catch (e) {
      console.warn('Chave Google Maps não encontrada no banco');
    }

    // 3. Enriquece com Google Places (se a chave existir)
    const enrichedPlaces = googleApiKey 
      ? await Promise.all(osmPlaces.map(p => enrichWithGoogle(p, googleApiKey)))
      : osmPlaces;

    // 4. Verifica duplicatas no banco
    const osmIds = enrichedPlaces.map(p => p.osm_id);
    const existing = await db.place.findMany({
      where: { googlePlaceId: { in: osmIds } },
      select: { googlePlaceId: true }
    });
    const importedIds = new Set(existing.map(e => e.googlePlaceId));

    // 5. Formata a resposta
    const places = enrichedPlaces.map(p => ({
      ...p,
      id: p.osm_id,
      alreadyImported: importedIds.has(p.osm_id),
    }));

    return NextResponse.json({ places });
  } catch (error: any) {
    console.error('Erro no mapeamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Mantém o GET funcionando (para o botão "Prospect")
export async function GET() {
  return NextResponse.json({ places: [], message: 'Use POST para buscar' });
}
