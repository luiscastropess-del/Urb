import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

// ==================== OPENSTREETMAP ====================
async function searchOSM(city: string, category?: string): Promise<any[]> {
  let query = '';
  
  if (category && category !== 'all') {
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
      query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; node(area.city)["name"~"${category}",i]; out body;`;
    }
  } else {
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
      console.log(`[OSM] Tentando: ${server}`);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Urb-Admin/1.0'
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        console.warn(`[OSM] ${server} falhou: ${res.status}`);
        continue;
      }

      const data = await res.json();
      console.log(`[OSM] ${data.elements?.length || 0} elementos`);
      
      if (!data.elements || data.elements.length === 0) {
        return [];
      }
      
      const places = data.elements
        .filter((el: any) => el.tags?.name)
        .map((el: any) => {
          const street = el.tags['addr:street'] || '';
          const number = el.tags['addr:housenumber'] || '';
          const district = el.tags['addr:suburb'] || el.tags['addr:district'] || '';
          const addressParts = [street, number, district].filter(Boolean);
          const address = addressParts.length > 0 
            ? `${addressParts.join(', ')} - ${city}` 
            : `${city}, SP`;
          
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

      console.log(`[OSM] ${places.length} lugares encontrados (${places.filter(p => p.hasFullAddress).length} com endereço completo)`);
      return places;
      
    } catch (error: any) {
      console.error(`[OSM] Erro no ${server}:`, error.message);
      continue;
    }
  }

  console.error('[OSM] Todos os servidores falharam');
  return [];
}

// ==================== GEOAPIFY ====================
async function searchGeoapify(city: string, category?: string): Promise<any[]> {
  const apiKey = await getProviderKey('GEOAPIFY_API');
  if (!apiKey) {
    console.warn('[Geoapify] Chave GEOAPIFY_API não encontrada no banco');
    return [];
  }

  try {
    // 1. Geocodificar a cidade
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=${apiKey}`;
    console.log(`[Geoapify] Geocodificando: ${city}`);
    
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      console.error(`[Geoapify] Cidade "${city}" não encontrada`);
      return [];
    }

    const { lat, lon } = geoData.results[0];
    console.log(`[Geoapify] Coordenadas: ${lat}, ${lon}`);

    // 2. Mapear categorias
    const categoryMap: Record<string, string> = {
      restaurant: 'catering.restaurant',
      cafe: 'catering.cafe',
      tourist_attraction: 'tourism',
      park: 'leisure.park',
      hotel: 'accommodation.hotel',
      supermarket: 'commercial.supermarket',
      bakery: 'catering.bakery',
      bar: 'catering.bar',
      pharmacy: 'healthcare.pharmacy',
      bank: 'service.bank',
    };

    let categories = 'catering,accommodation,tourism,entertainment,commercial';
    
    if (category && category !== 'all') {
      const apiCategory = categoryMap[category] || category;
      categories = apiCategory;
    }

    // 3. Buscar locais
    const filter = `circle:${lon},${lat},5000`;
    const placesUrl = `https://api.geoapify.com/v2/places?categories=${categories}&filter=${filter}&limit=50&apiKey=${apiKey}`;
    console.log(`[Geoapify] Buscando: ${placesUrl}`);
    
    const res = await fetch(placesUrl);
    const data = await res.json();

    console.log(`[Geoapify] ${data.features?.length || 0} locais retornados`);

    return (data.features || []).map((p: any) => {
      const props = p.properties;
      return {
        osm_id: `geoapify-${props.place_id}`,
        name: props.name || props.address_line1 || 'Sem nome',
        address: props.formatted || props.address_line1 || `${city}, SP`,
        phone: props.contact?.phone || null,
        website: props.contact?.website || null,
        instagram: null,
        category: props.categories?.[0] || category || 'Estabelecimento',
        type: props.categories?.[0] || category || 'Estabelecimento',
        lat: props.lat,
        lon: props.lon,
        opening_hours: null,
        hasFullAddress: !!(props.street && props.housenumber),
        placeId: props.place_id, // ID para usar no place-details
      };
    });

  } catch (error: any) {
    console.error('[Geoapify] Erro na busca:', error.message);
    return [];
  }
}

// ==================== ENRIQUECER COM GEOAPIFY DETAILS ====================
async function enrichWithGeoapifyDetails(place: any): Promise<any> {
  const apiKey = await getProviderKey('GEOAPIFY_API');
  if (!apiKey || !place.placeId) return place;

  try {
    const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${place.placeId}&apiKey=${apiKey}`;
    console.log(`[Geoapify Details] Buscando detalhes para: ${place.name}`);
    
    const res = await fetch(detailsUrl);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      console.log(`[Geoapify Details] Dados recebidos para: ${place.name}`);
      
      // Preenche campos detalhados
      place.name = props.name || place.name;
      place.address = props.formatted || props.address_line1 || place.address;
      place.phone = props.contact?.phone || place.phone;
      place.website = props.contact?.website || place.website;
      place.email = props.contact?.email || null;
      place.opening_hours = props.opening_hours || null;
      
      // Categorias detalhadas
      if (props.categories && props.categories.length > 0) {
        const mainCategory = props.categories[0];
        place.category = mainCategory;
        place.type = mainCategory;
        place.types = props.categories;
      }
      
      // Características
      if (props.features) {
        place.features = props.features;
      }
      
      // Redes sociais
      if (props.contact) {
        place.facebook = props.contact.facebook || null;
        place.instagram = props.contact.instagram || null;
        place.twitter = props.contact.twitter || null;
      }
      
      place.hasFullAddress = !!(props.street && props.housenumber);
      console.log(`[Geoapify Details] ${place.name} enriquecido com sucesso`);
    }
  } catch (error: any) {
    console.error(`[Geoapify Details] Erro:`, error.message);
  }

  return place;
}

// ==================== GOOGLE ENRICHMENT ====================
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

// ==================== ROTA PRINCIPAL ====================
export async function POST(req: Request) {
  try {
    const { city, category } = await req.json();

    if (!city) {
      return NextResponse.json({ error: 'Cidade é obrigatória' }, { status: 400 });
    }

    console.log(`\n🔍 Buscando locais em "${city}" com categoria "${category || 'todas'}"`);
    
    // 1. Tenta OSM primeiro
    let places = await searchOSM(city, category || undefined);
    
    // 2. Se OSM falhar, tenta Geoapify
    if (places.length === 0) {
      console.log('⚠️ OSM não retornou resultados. Tentando Geoapify...');
      places = await searchGeoapify(city, category || undefined);
      
      // 3. Enriquece com detalhes do Geoapify (para lugares do Geoapify)
      if (places.length > 0) {
        console.log('✨ Enriquecendo com detalhes do Geoapify...');
        places = await Promise.all(places.map(p => enrichWithGeoapifyDetails(p)));
      }
    }
    
    if (places.length === 0) {
      return NextResponse.json({ places: [], message: 'Nenhum local encontrado' });
    }

    // Busca chave do Google (opcional)
    let googleApiKey: string | undefined;
    try {
      const key = await getProviderKey('GOOGLE_MAPS_API_KEY');
      if (key) googleApiKey = key;
    } catch (e) {
      console.warn('Chave Google Maps não encontrada');
    }

    // Enriquece com Google (se chave existir)
    if (googleApiKey) {
      console.log('✨ Enriqueceu com Google Places...');
      places = await Promise.all(places.map(p => enrichWithGoogle(p, googleApiKey)));
    }

    // Verifica duplicatas
    const osmIds = places.map(p => p.osm_id);
    const existing = await db.place.findMany({
      where: { googlePlaceId: { in: osmIds } },
      select: { googlePlaceId: true }
    });
    const importedIds = new Set(existing.map(e => e.googlePlaceId));

    const finalPlaces = places.map(p => ({
      ...p,
      id: p.osm_id,
      alreadyImported: importedIds.has(p.osm_id),
    }));

    console.log(`✅ Retornando ${finalPlaces.length} lugares processados\n`);
    return NextResponse.json({ places: finalPlaces });
  } catch (error: any) {
    console.error('❌ Erro no mapeamento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ places: [], message: 'Use POST para buscar' });
}
