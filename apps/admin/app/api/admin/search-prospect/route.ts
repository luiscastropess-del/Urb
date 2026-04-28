import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';
import { GoogleGenAI } from '@google/genai';

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

// ==================== CONFIGURAÇÃO DOS MODELOS DE IA ====================
type AIModel = {
  name: string;
  displayName: string;
  purpose: 'search' | 'enrich' | 'fast' | 'deep';
  capabilities: string[];
};

const AI_MODELS: AIModel[] = [
  { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', purpose: 'fast', capabilities: ['search', 'categorize'] },
  { name: 'gemma-3-1b', displayName: 'Gemma 3 1B', purpose: 'fast', capabilities: ['quick_search'] },
  { name: 'gemma-3-4b', displayName: 'Gemma 3 4B', purpose: 'fast', capabilities: ['search', 'categorize'] },
  { name: 'gemma-3-12b', displayName: 'Gemma 3 12B', purpose: 'search', capabilities: ['search', 'enrich', 'categorize'] },
  { name: 'gemma-3-27b', displayName: 'Gemma 3 27B', purpose: 'deep', capabilities: ['search', 'enrich', 'deep_analysis'] },
  { name: 'gemma-3-2b', displayName: 'Gemma 3 2B', purpose: 'fast', capabilities: ['quick_search'] },
  { name: 'gemma-4-26b', displayName: 'Gemma 4 26B', purpose: 'deep', capabilities: ['search', 'enrich', 'deep_analysis', 'multilingual'] },
  { name: 'gemma-4-31b', displayName: 'Gemma 4 31B', purpose: 'deep', capabilities: ['search', 'enrich', 'deep_analysis', 'multilingual', 'advanced_reasoning'] },
  { name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', purpose: 'search', capabilities: ['search', 'enrich', 'categorize'] },
  { name: 'gemini-3.1-flash-lite', displayName: 'Gemini 3.1 Flash Lite', purpose: 'fast', capabilities: ['quick_search', 'categorize'] },
  { name: 'gemini-2', displayName: 'Gemini 2', purpose: 'search', capabilities: ['search', 'enrich', 'categorize'] },
  { name: 'gemini-2.5', displayName: 'Gemini 2.5', purpose: 'search', capabilities: ['search', 'enrich', 'categorize', 'multilingual'] },
];

// ==================== BUSCA COM IA ====================
async function searchWithAI(city: string, category?: string): Promise<any[]> {
  const apiKey = await getProviderKey('GEMINI');
  if (!apiKey) {
    console.warn('[AI Search] Chave GEMINI não encontrada');
    return [];
  }

  const aiClient = new GoogleGenAI({ apiKey });
  const results: any[] = [];

  // Usa modelos diferentes baseado na complexidade da busca
  const searchModels = category 
    ? ['gemma-3-12b', 'gemini-2.5-flash', 'gemma-4-26b']  // Categoria específica
    : ['gemma-4-31b', 'gemma-3-27b', 'gemini-2.5-pro'];      // Busca ampla

  for (const modelName of searchModels) {
    try {
      console.log(`[AI Search] Tentando com ${modelName}...`);
      
      const prompt = category 
        ? `Liste 10 estabelecimentos da categoria "${category}" em ${city}, SP. 
           Para cada um, forneça: nome, endereço completo (rua, número, bairro), telefone se souber.
           Retorne APENAS um array JSON válido no formato:
           [{"name": "Nome", "address": "Rua X, 123 - Bairro", "phone": "(19) 9999-9999", "category": "${category}"}]`
        : `Liste 15 estabelecimentos variados e populares em ${city}, SP (restaurantes, cafés, lojas, atrações).
           Para cada um, forneça: nome, endereço completo, categoria.
           Retorne APENAS um array JSON válido.`;

      const result = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      if (result.text) {
        const places = JSON.parse(result.text);
        if (Array.isArray(places) && places.length > 0) {
          const mappedPlaces = places.map((p: any, i: number) => ({
            osm_id: `ai-${modelName}-${Date.now()}-${i}`,
            name: p.name || `Local ${i + 1}`,
            address: p.address || `${city}, SP`,
            phone: p.phone || null,
            website: p.website || null,
            instagram: p.instagram || null,
            category: p.category || category || 'Estabelecimento',
            type: p.category || category || 'Estabelecimento',
            lat: null,
            lon: null,
            opening_hours: null,
            hasFullAddress: !!(p.address && p.address.includes(',')),
            source: modelName,
          }));
          
          console.log(`[AI Search] ${modelName} retornou ${mappedPlaces.length} lugares`);
          results.push(...mappedPlaces);
          break; // Se deu certo, não precisa tentar outros modelos
        }
      }
    } catch (error: any) {
      console.warn(`[AI Search] ${modelName} falhou:`, error.message);
      continue;
    }
  }

  return results;
}

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
            source: 'osm',
          };
        });

      console.log(`[OSM] ${places.length} lugares encontrados`);
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
    console.warn('[Geoapify] Chave GEOAPIFY_API não encontrada');
    return [];
  }

  try {
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=${apiKey}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      console.error(`[Geoapify] Cidade "${city}" não encontrada`);
      return [];
    }

    const { lat, lon } = geoData.results[0];

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
      categories = categoryMap[category] || category;
    }

    const filter = `circle:${lon},${lat},5000`;
    const placesUrl = `https://api.geoapify.com/v2/places?categories=${categories}&filter=${filter}&limit=50&apiKey=${apiKey}`;
    
    const res = await fetch(placesUrl);
    const data = await res.json();

    console.log(`[Geoapify] ${data.features?.length || 0} locais`);

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
        placeId: props.place_id,
        source: 'geoapify',
      };
    });

  } catch (error: any) {
    console.error('[Geoapify] Erro:', error.message);
    return [];
  }
}

// ==================== ENRIQUECIMENTO COM IA ====================
async function enrichWithAI(place: any, task: 'description' | 'details' | 'all' = 'all'): Promise<any> {
  const apiKey = await getProviderKey('GEMINI');
  if (!apiKey) return place;

  const aiClient = new GoogleGenAI({ apiKey });

  try {
    if (task === 'description' || task === 'all') {
      // Modelos leves para descrições
      const prompt = `Gere uma descrição atraente em português (Brasil) para: ${place.name} (${place.category || 'Estabelecimento'}) em ${place.address || 'Holambra, SP'}. Máximo 300 caracteres.`;
      
      const result = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 500 }
      });
      
      if (result.text) {
        place.description = result.text;
      }
    }

    if (task === 'details' || task === 'all') {
      // Modelos mais potentes para detalhes
      const prompt = `Para o estabelecimento "${place.name}" em ${place.address || 'Holambra, SP'}, 
        sugira: 3-5 categorias relevantes, horário de funcionamento típico, e faixa de preço ($ a $$$$).
        Retorne JSON: {"categories": [...], "hours": "...", "priceLevel": "$$"}`;
      
      const result = await aiClient.models.generateContent({
        model: 'gemma-3-12b',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      if (result.text) {
        const details = JSON.parse(result.text);
        if (details.categories) place.types = details.categories;
        if (details.hours) place.opening_hours = details.hours;
        if (details.priceLevel) place.priceLevel = details.priceLevel;
      }
    }
  } catch (error: any) {
    console.error(`[AI Enrich] Erro:`, error.message);
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

    console.log(`\n🔍 Buscando em "${city}" - Categoria: "${category || 'todas'}"`);
    
    let places: any[] = [];
    
    // 1. Tenta OSM
    console.log('📡 Tentando OpenStreetMap...');
    places = await searchOSM(city, category || undefined);
    
    // 2. Se OSM falhar, tenta Geoapify
    if (places.length === 0) {
      console.log('📡 Tentando Geoapify...');
      places = await searchGeoapify(city, category || undefined);
    }
    
    // 3. Se ainda não encontrou, usa IA
    if (places.length === 0) {
      console.log('🤖 Buscando com IA...');
      places = await searchWithAI(city, category || undefined);
    }
    
    // 4. Enriquece com IA (descrições e categorias)
    if (places.length > 0) {
      console.log('✨ Enriquecendo com IA...');
      places = await Promise.all(places.map(p => enrichWithAI(p, 'all')));
    }
    
    if (places.length === 0) {
      return NextResponse.json({ places: [], message: 'Nenhum local encontrado em nenhuma fonte' });
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

    console.log(`✅ ${finalPlaces.length} lugares encontrados (fonte: ${finalPlaces[0]?.source || 'desconhecida'})\n`);
    return NextResponse.json({ places: finalPlaces });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ places: [], message: 'Use POST para buscar' });
}
