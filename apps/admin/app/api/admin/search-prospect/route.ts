import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

async function searchOSM(city: string, category?: string): Promise<any[]> {
  let query = '';
  
  if (category && category !== 'all') {
    // Busca por categoria específica
    const categoryMap: Record<string, string> = {
      restaurant: 'amenity=restaurant',
      cafe: 'amenity=cafe',
      tourist_attraction: 'tourism=attraction',
      park: 'leisure=park',
      hotel: 'tourism=hotel',
      bakery: 'shop=bakery',
      bar: 'amenity=bar',
      supermarket: 'shop=supermarket',
      pharmacy: 'amenity=pharmacy',
      bank: 'amenity=bank',
      school: 'amenity=school',
      church: 'amenity=place_of_worship',
    };
    
    const osmTag = categoryMap[category] || `"${category}"`;
    
    if (osmTag.includes('=')) {
      const [key, value] = osmTag.split('=');
      query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; node(area.city)["${key}"="${value}"]; out body;`;
    } else {
      // Busca genérica pela palavra-chave
      query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; node(area.city)["name"~"${category}",i]; out body;`;
    }
  } else {
    // Sem categoria: busca os locais mais relevantes da cidade
    query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; (
      node(area.city)["amenity"];
      node(area.city)["tourism"];
      node(area.city)["shop"];
      node(area.city)["leisure"];
    ); out body 50;`;
  }
  
  const encodedQuery = encodeURIComponent(query);
  
  for (const server of OVERPASS_SERVERS) {
    try {
      const url = `${server}?data=${encodedQuery}`;
      console.log(`Tentando Overpass: ${server}`);
      console.log(`Query: ${query.substring(0, 200)}...`);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Urb-Admin/1.0'
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        console.warn(`Overpass ${server} falhou: ${res.status}`);
        continue;
      }

      const data = await res.json();
      console.log(`Overpass retornou ${data.elements?.length || 0} elementos`);
      
      if (!data.elements || data.elements.length === 0) {
        return [];
      }
      
      // Mapeia TODOS os locais, mesmo sem endereço completo
      const places = data.elements
        .filter((el: any) => el.tags?.name) // só precisa ter nome
        .map((el: any) => {
          // Monta o endereço com o que estiver disponível
          const street = el.tags['addr:street'] || '';
          const number = el.tags['addr:housenumber'] || '';
          const district = el.tags['addr:suburb'] || el.tags['addr:district'] || '';
          const addressParts = [street, number, district].filter(Boolean);
          const address = addressParts.length > 0 
            ? `${addressParts.join(', ')} - ${city}` 
            : `${city}, SP`;
          
          // Determina a categoria baseada nas tags OSM
          let detectedCategory = category || 'all';
          if (!category || category === 'all') {
            if (el.tags.amenity) detectedCategory = el.tags.amenity;
            else if (el.tags.tourism) detectedCategory = el.tags.tourism;
            else if (el.tags.shop) detectedCategory = el.tags.shop;
            else if (el.tags.leisure) detectedCategory = el.tags.leisure;
          }
          
          return {
            osm_id: `osm-${el.id}`,
            name: el.tags.name,
            address: address,
            phone: el.tags.phone || el.tags['contact:phone'] || null,
            website: el.tags.website || el.tags['contact:website'] || null,
            instagram: el.tags['contact:instagram'] || null,
            category: detectedCategory,
            type: detectedCategory,
            lat: el.lat,
            lon: el.lon,
            opening_hours: el.tags.opening_hours || null,
            hasFullAddress: !!(street && number),
          };
        });

      console.log(`${places.length} lugares encontrados (${places.filter(p => p.hasFullAddress).length} com endereço completo)`);
      return places;
      
    } catch (error: any) {
      console.error(`Erro no servidor ${server}:`, error.message);
      continue;
    }
  }

  console.error('Todos os servidores Overpass falharam');
  return [];
}

async function enrichWithGoogle(place: any, googleApiKey: string) {
  if (!googleApiKey) return place;

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(place.name + ' ' + place.address)}&key=${googleApiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.results && searchData.results.length > 0) {
      const googlePlace = searchData.results[0];
      
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

    if (!city) {
      return NextResponse.json({ error: 'Cidade é obrigatória' }, { status: 400 });
    }

    console.log(`Buscando locais em "${city}" com categoria "${category || 'todas'}"`);
    
    const osmPlaces = await searchOSM(city, category || undefined);
    
    if (osmPlaces.length === 0) {
      return NextResponse.json({ places: [], message: 'Nenhum local encontrado' });
    }

    // Busca chave do Google
    let googleApiKey: string | undefined;
    try {
      const key = await getProviderKey('GOOGLE_MAPS_API_KEY');
      if (key) googleApiKey = key;
    } catch (e) {
      console.warn('Chave Google Maps não encontrada');
    }

    // Enriquece com Google (se chave existir)
    const enrichedPlaces = googleApiKey 
      ? await Promise.all(osmPlaces.map(p => enrichWithGoogle(p, googleApiKey)))
      : osmPlaces;

    // Verifica duplicatas
    const osmIds = enrichedPlaces.map(p => p.osm_id);
    const existing = await db.place.findMany({
      where: { googlePlaceId: { in: osmIds } },
      select: { googlePlaceId: true }
    });
    const importedIds = new Set(existing.map(e => e.googlePlaceId));

    const places = enrichedPlaces.map(p => ({
      ...p,
      id: p.osm_id,
      alreadyImported: importedIds.has(p.osm_id),
    }));

    console.log(`Retornando ${places.length} lugares`);
    return NextResponse.json({ places });
  } catch (error: any) {
    console.error('Erro no mapeamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ places: [], message: 'Use POST para buscar' });
}
