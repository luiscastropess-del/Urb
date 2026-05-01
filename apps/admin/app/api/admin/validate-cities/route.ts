import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';
import Groq from 'groq-sdk';
export const dynamic = 'force-dynamic';

// ==================== GROQ ====================
async function getGroqClient(): Promise<Groq | null> {
  const apiKey = await getProviderKey('GROQ_API');
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// ==================== IMAGENS DA CIDADE ====================
async function getCityImages(cityName: string, state?: string): Promise<string[]> {
  const images: string[] = [];
  const headers = {
    'User-Agent': 'UrbAdmin/1.0 (https://github.com/luiscastropess-del/Urb)'
  };

  // Wikimedia Commons (busca por nome + estado)
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cityName + ' ' + (state || '') + ' cidade')}&srnamespace=6&srlimit=5&format=json&origin=*`;
    const res = await fetch(searchUrl, { headers });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.query?.search) {
        for (const item of data.query.search) {
          const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&pageids=${item.pageid}&format=json&origin=*`;
          const imgRes = await fetch(imgUrl, { headers });
          if (imgRes.ok) {
            const imgData = await imgRes.json().catch(() => null);
            const page = imgData?.query?.pages?.[item.pageid];
            if (page?.imageinfo?.[0]?.url) {
              images.push(page.imageinfo[0].url);
            }
          }
        }
      }
    }
  } catch (e) {}

  // OSM - busca por tag image em pontos turísticos da cidade
  try {
    const osmQuery = `[out:json]; area["name"="${cityName}"]["boundary"="administrative"]; node(area)["tourism"][image]; out body 3;`;
    const osmUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`;
    const osmRes = await fetch(osmUrl);
    if (osmRes.ok) {
      const osmData = await osmRes.json().catch(() => null);
      if (osmData?.elements) {
        for (const el of osmData.elements) {
          if (el.tags?.image && !images.includes(el.tags.image)) {
            images.push(el.tags.image);
          }
        }
      }
    }
  } catch (e) {}

  return images.slice(0, 5);
}

// ==================== COORDENADAS VIA GEOAPIFY ====================
async function getCityCoordinates(cityName: string): Promise<{ lat: number; lon: number; state: string } | null> {
  const apiKey = await getProviderKey('GEOAPIFY_API');
  if (!apiKey) return null;

  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName + ', Brasil')}&format=json&apiKey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results?.length > 0) {
      const r = data.results[0];
      return {
        lat: r.lat,
        lon: r.lon,
        state: r.state || '',
      };
    }
  } catch (e) {}
  return null;
}

// ==================== ANÁLISE COM IA (GROQ) ====================
async function analyzeCity(cityName: string, state?: string): Promise<{
  description: string;
  isTouristic: boolean;
}> {
  const groq = await getGroqClient();
  if (!groq) {
    return {
      description: `${cityName} é uma cidade encantadora, perfeita para explorar a cultura e as belezas do interior paulista.`,
      isTouristic: false,
    };
  }

  const prompt = `Analise a cidade "${cityName}"${state ? `, ${state}` : ''} no Brasil.

1. Gere uma descrição atraente em português (Brasil) com até 400 caracteres, destacando seus principais atrativos turísticos, cultura e características únicas.
2. Determine se é uma cidade TURÍSTICA ou NÃO_TURÍSTICA.

Retorne APENAS um JSON válido no formato:
{
  "description": "descrição aqui",
  "isTouristic": true
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um especialista em turismo brasileiro.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        description: result.description || `${cityName} é uma cidade encantadora.`,
        isTouristic: result.isTouristic === true,
      };
    }
  } catch (e) {}

  return {
    description: `${cityName} é uma cidade encantadora, perfeita para explorar a cultura e as belezas do interior paulista.`,
    isTouristic: false,
  };
}

// ==================== ROTA PRINCIPAL ====================
export async function POST() {
  try {
    console.log('\n🏙️  INICIANDO VALIDAÇÃO DE CIDADES...');
    
    // 1. Busca cidades distintas da base de locais
    const places = await db.place.findMany({
      select: { city: true },
      distinct: ['city'],
      where: { city: { not: null } },
    });
    const citiesFromPlaces = [...new Set(places.map(p => p.city?.trim()).filter(Boolean))];
    console.log(`📍 ${citiesFromPlaces.length} cidades encontradas nos locais`);

    // 2. Busca cidades já cadastradas
    const existingCities = await db.city.findMany({
      select: { name: true },
    });
    const existingCityNames = new Set(existingCities.map(c => c.name.toLowerCase().trim()));
    console.log(`✅ ${existingCityNames.size} cidades já cadastradas`);

    // 3. Encontra cidades faltantes
    const missingCities = citiesFromPlaces.filter(city => !existingCityNames.has(city.toLowerCase().trim()));
    console.log(`🆕 ${missingCities.length} cidades para criar`);

    if (missingCities.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Todas as cidades já estão cadastradas!',
        created: 0,
      });
    }

    // 4. Para cada cidade faltante, coleta dados e cria
    let created = 0;
    const results = [];

    for (const cityName of missingCities) {
      console.log(`\n🏗️  Processando: ${cityName}`);
      
      // Coordenadas e estado via Geoapify
      const coords = await getCityCoordinates(cityName);
      const state = coords?.state || 'SP';
      
      // Imagens da cidade
      const images = await getCityImages(cityName, state);
      const coverImage = images[0] || null;
      const profileImage = images[1] || coverImage;
      const gallery = images.slice(0, 5);
      
      // Análise com IA
      const { description, isTouristic } = await analyzeCity(cityName, state);

     // 5. Cria a cidade no banco de dados
const newCity = await db.city.create({
  data: {
    name: cityName,
    state: state,
    description: description,
    coverImage: coverImage || `https://source.unsplash.com/800x600/?${encodeURIComponent(cityName)},city`,
    profileImage: profileImage || `https://source.unsplash.com/400x400/?${encodeURIComponent(cityName)},city`,
    galleryImages: gallery,
    featured: isTouristic,
  },
});

      created++;
      results.push({ name: cityName, featured: isTouristic });
      console.log(`✅ ${cityName} criada (${isTouristic ? '⭐ turística' : 'normal'})`);
      
      // Pequena pausa para não sobrecarregar APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 ${created} cidades criadas com sucesso!`);
    console.log('='.repeat(50));

    return NextResponse.json({
      success: true,
      message: `${created} cidades criadas com sucesso!`,
      created,
      cities: results,
    });
  } catch (error: any) {
    console.error('❌ Erro na validação:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
