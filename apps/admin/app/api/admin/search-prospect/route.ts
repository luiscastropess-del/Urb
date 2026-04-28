import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';
import Groq from 'groq-sdk';

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

// ==================== LIMITES DE PROSPECÇÃO ====================
const MAX_PLACES_PER_SEARCH = 40;
const BATCH_SIZE = 10; // Para enriquecimento em lotes

// ==================== CONFIGURAÇÃO GROQ ====================
const GROQ_MODELS = {
  primary: 'llama-3.3-70b-versatile',
  reasoning: 'meta-llama/llama-4-scout-17b-16e-instruct',
  fast: 'llama-3.1-8b-instant',
  vision: 'llama-3.2-90b-vision-preview',
};

async function getGroqClient(): Promise<Groq | null> {
  const apiKey = await getProviderKey('GROQ_API');
  if (!apiKey) {
    console.warn('[Groq] Chave GROQ_API não encontrada no banco');
    return null;
  }
  return new Groq({ apiKey });
}

// ==================== COLETA DE IMAGENS ====================
async function getOSMImage(place: any): Promise<string | null> {
  if (!place.lat || !place.lon) return null;
  try {
    const query = `[out:json]; node(${place.lat - 0.001},${place.lon - 0.001},${place.lat + 0.001},${place.lon + 0.001}); out body;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.elements && data.elements.length > 0) {
      const element = data.elements[0];
      const imageTag = element.tags?.image || element.tags?.image_1 || null;
      if (imageTag) {
        console.log(`[OSM Image] Imagem encontrada para ${place.name}: ${imageTag}`);
        return imageTag;
      }
    }
  } catch (error: any) {
    console.warn(`[OSM Image] Erro:`, error.message);
  }
  return null;
}

async function getWikimediaImages(place: any): Promise<string[]> {
  const images: string[] = [];
  try {
    if (place.lat && place.lon) {
      const radius = 100;
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gsradius=${radius}&gscoord=${place.lat}|${place.lon}&gslimit=5&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.query?.geosearch) {
        for (const item of data.query.geosearch) {
          const pageId = item.pageid;
          const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&pageids=${pageId}&format=json&origin=*`;
          const imgRes = await fetch(imageUrl);
          const imgData = await imgRes.json();
          const page = imgData.query?.pages?.[pageId];
          if (page?.imageinfo?.[0]?.url) {
            images.push(page.imageinfo[0].url);
          }
        }
      }
    }
    if (images.length < 3 && place.name) {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(place.name)}&srnamespace=6&srlimit=5&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (searchData.query?.search) {
        for (const item of searchData.query.search) {
          const pageId = item.pageid;
          const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&pageids=${pageId}&format=json&origin=*`;
          const imgRes = await fetch(imageUrl);
          const imgData = await imgRes.json();
          const page = imgData.query?.pages?.[pageId];
          if (page?.imageinfo?.[0]?.url) {
            images.push(page.imageinfo[0].url);
          }
        }
      }
    }
    console.log(`[Wikimedia] ${images.length} imagens para ${place.name}`);
  } catch (error: any) {
    console.warn(`[Wikimedia] Erro:`, error.message);
  }
  return images;
}

async function getGeoapifyImages(place: any): Promise<string[]> {
  const apiKey = await getProviderKey('GEOAPIFY_API');
  if (!apiKey || !place.placeId) return [];
  const images: string[] = [];
  try {
    const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${place.placeId}&apiKey=${apiKey}`;
    const res = await fetch(detailsUrl);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      if (props.photo_urls && Array.isArray(props.photo_urls)) {
        images.push(...props.photo_urls);
      }
      if (props.logo_url) images.push(props.logo_url);
      if (props.icon_url) images.push(props.icon_url);
    }
    console.log(`[Geoapify Images] ${images.length} imagens para ${place.name}`);
  } catch (error: any) {
    console.warn(`[Geoapify Images] Erro:`, error.message);
  }
  return images;
}

async function collectAllImages(place: any): Promise<string[]> {
  const allImages: string[] = [];
  const [osmImage, wikimediaImages, geoapifyImages] = await Promise.all([
    getOSMImage(place).catch(() => null),
    getWikimediaImages(place).catch(() => []),
    getGeoapifyImages(place).catch(() => []),
  ]);
  if (osmImage) allImages.push(osmImage);
  allImages.push(...wikimediaImages);
  allImages.push(...geoapifyImages);
  return [...new Set(allImages)];
}

// ==================== BUSCA COM GROQ AI ====================
async function searchWithGroqAI(city: string, category?: string): Promise<any[]> {
  const groq = await getGroqClient();
  if (!groq) return [];

  console.log(`[Groq AI] Buscando locais em "${city}" - Categoria: "${category || 'todas'}"`);

  try {
    const prompt = category && category !== 'all'
      ? `Você é um especialista em dados locais do Brasil. 
         Liste EXATAMENTE 15 estabelecimentos REAIS da categoria "${category}" em "${city}, SP".
         
         REGRAS IMPORTANTES:
         - Apenas estabelecimentos que REALMENTE EXISTEM
         - Endereços devem ser reais e verificáveis
         - NÃO invente lugares fictícios
         
         Para cada local, forneça esses campos EXATOS:
         - name: nome real do estabelecimento
         - address: endereço completo (rua, número, bairro)
         - phone: telefone real (se souber)
         - category: "${category}"
         
         Retorne APENAS um array JSON válido, sem texto adicional.`
      : `Você é um especialista em dados locais do Brasil.
         Liste EXATAMENTE 20 estabelecimentos REAIS e POPULARES em "${city}, SP".
         
         REGRAS IMPORTANTES:
         - Apenas estabelecimentos que REALMENTE EXISTEM
         - Variedade: restaurantes, cafés, lojas, atrações turísticas
         - Endereços devem ser reais e verificáveis
         - NÃO invente lugares fictícios
         
         Para cada local, forneça:
         - name: nome real do estabelecimento
         - address: endereço completo (rua, número, bairro)
         - phone: telefone real (se souber)
         - category: categoria do estabelecimento
         
         Retorne APENAS um array JSON válido, sem texto adicional.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em dados geográficos brasileiros. Forneça apenas informações precisas e verificáveis. Retorne sempre JSON válido.'
        },
        { role: 'user', content: prompt }
      ],
      model: GROQ_MODELS.reasoning,
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 0.9,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('[Groq AI] Resposta não contém JSON válido');
      return [];
    }

    const places = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(places) || places.length === 0) {
      console.warn('[Groq AI] Array vazio ou inválido');
      return [];
    }

    const mappedPlaces = places.map((p: any, i: number) => ({
      osm_id: `groq-${Date.now()}-${i}`,
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
      source: 'groq-ai',
      verified: false,
    }));

    console.log(`[Groq AI] ${mappedPlaces.length} lugares encontrados via IA`);
    return mappedPlaces.slice(0, MAX_PLACES_PER_SEARCH);

  } catch (error: any) {
    console.error('[Groq AI] Erro na busca:', error.message);
    return [];
  }
}

// ==================== ENRIQUECIMENTO COM GROQ ====================
async function enrichWithGroq(place: any): Promise<any> {
  const groq = await getGroqClient();
  if (!groq) return place;

  console.log(`[Groq Enrich] Processando: ${place.name}`);

  try {
    // Descrição
    if (!place.description || place.description.length < 50) {
      const descPrompt = `Gere uma descrição comercial atraente e profissional em português (Brasil) para:
      
      Estabelecimento: ${place.name}
      Categoria: ${place.category || place.type || 'Estabelecimento'}
      Cidade: ${place.address || 'Holambra, SP'}
      
      REGRAS:
      - Máximo 300 caracteres
      - Destaque 2-3 pontos fortes
      - Tom amigável e convidativo
      - Use emojis moderadamente
      - NÃO invente informações que não foram fornecidas
      
      Retorne APENAS a descrição, sem aspas ou texto adicional.`;

      const descCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'Você é um redator publicitário especializado em turismo e gastronomia. Suas descrições são concisas e atraentes.' },
          { role: 'user', content: descPrompt }
        ],
        model: GROQ_MODELS.primary,
        temperature: 0.8,
        max_tokens: 400,
      });

      const description = descCompletion.choices[0]?.message?.content?.trim();
      if (description && description.length > 20) {
        place.description = description;
      }
    }

    // Categorias
    const catPrompt = `Para o estabelecimento "${place.name}" (${place.category || 'Não categorizado'}):
    
    Sugira 3-5 categorias/tags relevantes que descrevam este negócio.
    
    Exemplos: "restaurante italiano", "café artesanal", "turismo rural", "comida caseira", "pet friendly"
    
    Retorne APENAS um array JSON de strings: ["categoria1", "categoria2", "categoria3"]`;

    const catCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um especialista em categorização de estabelecimentos comerciais. Retorne sempre JSON válido.' },
        { role: 'user', content: catPrompt }
      ],
      model: GROQ_MODELS.fast,
      temperature: 0.6,
      max_tokens: 300,
    });

    try {
      const catText = catCompletion.choices[0]?.message?.content || '';
      const jsonMatch = catText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const categories = JSON.parse(jsonMatch[0]);
        if (Array.isArray(categories) && categories.length > 0) {
          place.types = [...new Set([...(place.types || []), ...categories])];
        }
      }
    } catch (parseError) {
      console.warn('[Groq Enrich] Erro ao parsear categorias');
    }

    // Imagens
    if (!place.photos || place.photos.length === 0) {
      place.photos = await collectAllImages(place);
      if (place.photos.length > 0 && !place.coverImage) {
        place.coverImage = place.photos[0];
      }
      if (place.photos.length > 1 && !place.profileImage) {
        place.profileImage = place.photos[1];
      }
    }

  } catch (error: any) {
    console.error(`[Groq Enrich] Erro:`, error.message);
  }

  return place;
}

// ==================== VERIFICAÇÃO DE DADOS COM GROQ ====================
async function verifyWithGroq(places: any[]): Promise<any[]> {
  const groq = await getGroqClient();
  if (!groq) return places;

  console.log(`[Groq Verify] Verificando ${places.length} lugares...`);

  try {
    const placesList = places.map((p, i) => 
      `${i + 1}. ${p.name} - ${p.address || 'Endereço não informado'}`
    ).join('\n');

    const prompt = `Verifique se os seguintes estabelecimentos REALMENTE existem em Holambra/SP ou região próxima:
    
    ${placesList}
    
    Para cada um, responda se é REAL ou se parece ser FICTÍCIO.
    Retorne APENAS um array JSON com os índices dos lugares que parecem ser REAIS.
    Exemplo: [1, 3, 5, 7]
    
    Considere:
    - Nomes de estabelecimentos conhecidos na região
    - Endereços em ruas que existem na cidade
    - Se o tipo de negócio é comum na região`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um especialista em verificação de dados locais. Seja criterioso.' },
        { role: 'user', content: prompt }
      ],
      model: GROQ_MODELS.reasoning,
      temperature: 0.2,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const verifiedIndices = JSON.parse(jsonMatch[0]);
      if (Array.isArray(verifiedIndices)) {
        places.forEach((place, i) => {
          place.verified = verifiedIndices.includes(i + 1);
        });
        const verifiedCount = places.filter(p => p.verified).length;
        console.log(`[Groq Verify] ${verifiedCount}/${places.length} lugares verificados como reais`);
      }
    }

  } catch (error: any) {
    console.error('[Groq Verify] Erro:', error.message);
  }

  return places;
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
      query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; node(area.city)["${key}"="${value}"]; out body 40;`;
    } else {
      query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; node(area.city)["name"~"${category}",i]; out body 40;`;
    }
  } else {
    query = `[out:json]; area["name"="${city}"]["boundary"="administrative"]->.city; (
      node(area.city)["amenity"];
      node(area.city)["tourism"];
      node(area.city)["shop"];
      node(area.city)["leisure"];
    ); out body 40;`;
  }
  
  const encodedQuery = encodeURIComponent(query);
  
  for (const server of OVERPASS_SERVERS) {
    try {
      const url = `${server}?data=${encodedQuery}`;
      console.log(`[OSM] Tentando: ${server.split('/')[2]}`);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Urb-Admin/1.0'
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        console.warn(`[OSM] ${server.split('/')[2]} falhou: ${res.status}`);
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
            verified: true,
          };
        });

      console.log(`[OSM] ${places.length} lugares encontrados`);
      return places.slice(0, MAX_PLACES_PER_SEARCH);
      
    } catch (error: any) {
      console.error(`[OSM] Erro:`, error.message);
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
    const placesUrl = `https://api.geoapify.com/v2/places?categories=${categories}&filter=${filter}&limit=40&apiKey=${apiKey}`;
    
    const res = await fetch(placesUrl);
    const data = await res.json();

    console.log(`[Geoapify] ${data.features?.length || 0} locais`);

    return (data.features || []).slice(0, MAX_PLACES_PER_SEARCH).map((p: any) => {
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
        verified: true,
      };
    });

  } catch (error: any) {
    console.error('[Geoapify] Erro:', error.message);
    return [];
  }
}

// ==================== ROTA PRINCIPAL ====================
export async function POST(req: Request) {
  try {
    const { city, category } = await req.json();

    if (!city) {
      return NextResponse.json({ error: 'Cidade é obrigatória' }, { status: 400 });
    }

    console.log(`\n🔍 BUSCA INICIADA: "${city}" - Categoria: "${category || 'todas'}"`);
    console.log('='.repeat(60));
    
    let places: any[] = [];
    
    // CAMADA 1: OpenStreetMap
    console.log('📡 CAMADA 1: OpenStreetMap');
    places = await searchOSM(city, category || undefined);
    
    // CAMADA 2: Geoapify
    if (places.length === 0) {
      console.log('📡 CAMADA 2: Geoapify');
      places = await searchGeoapify(city, category || undefined);
    }
    
    // CAMADA 3: Groq AI
    if (places.length === 0) {
      console.log('🤖 CAMADA 3: Groq AI');
      places = await searchWithGroqAI(city, category || undefined);
    }
    
    // Enriquece com Groq (descrições, categorias, imagens)
    if (places.length > 0) {
      console.log(`\n✨ ENRIQUECENDO ${places.length} lugares...`);
      console.log('-'.repeat(40));
      
      // Lotes
      for (let i = 0; i < places.length; i += BATCH_SIZE) {
        const batch = places.slice(i, i + BATCH_SIZE);
        const enrichedBatch = await Promise.all(batch.map(p => enrichWithGroq(p)));
        places.splice(i, BATCH_SIZE, ...enrichedBatch);
        console.log(`[Batch] Enriqueceu ${i + batch.length}/${places.length}`);
        if (i + BATCH_SIZE < places.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Verifica autenticidade (apenas lugares de IA)
      const aiPlaces = places.filter(p => p.source === 'groq-ai');
      if (aiPlaces.length > 0) {
        console.log('\n🔍 VERIFICANDO autenticidade...');
        places = await verifyWithGroq(places);
      }
    }
    
    if (places.length === 0) {
      console.log('❌ Nenhum local encontrado');
      return NextResponse.json({ 
        places: [], 
        message: 'Nenhum local encontrado. Tente outra cidade ou categoria.' 
      });
    }

    // Verifica duplicatas no banco
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

    // Estatísticas
    const sources = finalPlaces.reduce((acc: any, p) => {
      acc[p.source] = (acc[p.source] || 0) + 1;
      return acc;
    }, {});
    
    const verifiedCount = finalPlaces.filter(p => p.verified).length;
    const fullAddressCount = finalPlaces.filter(p => p.hasFullAddress).length;

    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Total: ${finalPlaces.length} lugares`);
    console.log(`   Fontes: ${JSON.stringify(sources)}`);
    console.log(`   Verificados: ${verifiedCount}`);
    console.log(`   Endereço completo: ${fullAddressCount}`);
    console.log(`   Já importados: ${importedIds.size}`);
    console.log('='.repeat(60) + '\n');

    return NextResponse.json({ 
      places: finalPlaces.slice(0, MAX_PLACES_PER_SEARCH),
      stats: {
        total: finalPlaces.length,
        sources,
        verified: verifiedCount,
        fullAddress: fullAddressCount,
        alreadyImported: importedIds.size,
      }
    });
  } catch (error: any) {
    console.error('❌ Erro na busca:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ places: [], message: 'Use POST para buscar' });
}
