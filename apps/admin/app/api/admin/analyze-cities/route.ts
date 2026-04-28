import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';
import Groq from 'groq-sdk';

// ==================== GROQ ====================
async function getGroqClient(): Promise<Groq | null> {
  const apiKey = await getProviderKey('GROQ_API');
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

// ==================== ANALISAR SE É REALMENTE UMA CIDADE ====================
async function analyzeIfCity(name: string): Promise<{
  isCity: boolean;
  cityName: string;
  state: string;
  reason: string;
}> {
  const groq = await getGroqClient();
  if (!groq) {
    return { isCity: true, cityName: name, state: '', reason: 'Sem IA disponível' };
  }

  const prompt = `Analise o seguinte nome: "${name}".

Determine se isso é o nome de uma CIDADE/MUNICÍPIO brasileiro ou se é outra coisa (rua, bairro, estabelecimento, ponto turístico, etc.).

Se NÃO for uma cidade, identifique a qual CIDADE esse local pertence e qual o ESTADO (UF).

Retorne APENAS um JSON válido no formato:
{
  "isCity": true ou false,
  "cityName": "nome da cidade correta",
  "state": "UF",
  "reason": "breve explicação"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um especialista em geografia brasileira. Analise nomes e determine se são cidades ou não.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 300,
    });

    const text = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isCity: result.isCity !== false,
        cityName: result.cityName || name,
        state: result.state || '',
        reason: result.reason || '',
      };
    }
  } catch (e) {}

  return { isCity: true, cityName: name, state: '', reason: 'Falha na análise' };
}

// ==================== GEOAPIFY - COORDENADAS E CONFIRMAÇÃO ====================
async function getCityCoordinates(cityName: string): Promise<{ lat: number; lon: number; state: string; displayName: string } | null> {
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
        displayName: r.city || r.county || r.name || cityName,
      };
    }
  } catch (e) {}
  return null;
}

// ==================== BUSCAR IMAGENS ====================
async function getCityImages(cityName: string, state?: string): Promise<string[]> {
  const images: string[] = [];
  const headers = {
    'User-Agent': 'UrbAdmin/1.0 (https://github.com/luiscastropess-del/Urb)'
  };

  // Wikimedia Commons
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
            if (page?.imageinfo?.[0]?.url) images.push(page.imageinfo[0].url);
          }
        }
      }
    }
  } catch (e) {}

  // OSM image tag
  try {
    const osmQuery = `[out:json]; area["name"="${cityName}"]["boundary"="administrative"]; node(area)["tourism"][image]; out body 3;`;
    const osmUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`;
    const osmRes = await fetch(osmUrl);
    if (osmRes.ok) {
      const osmData = await osmRes.json().catch(() => null);
      if (osmData?.elements) {
        for (const el of osmData.elements) {
          if (el.tags?.image && !images.includes(el.tags.image)) images.push(el.tags.image);
        }
      }
    }
  } catch (e) {}

  return images.slice(0, 5);
}

// ==================== GERAR DESCRIÇÃO COM IA ====================
async function generateCityDescription(cityName: string, state: string): Promise<string> {
  const groq = await getGroqClient();
  if (!groq) return `${cityName} é uma cidade encantadora do interior.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um redator especializado em turismo.' },
        { role: 'user', content: `Gere uma descrição de até 400 caracteres para a cidade de ${cityName}, ${state}. Destaque seus atrativos.` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 400,
    });
    return completion.choices[0]?.message?.content || `${cityName} é uma cidade encantadora.`;
  } catch (e) {}
  return `${cityName} é uma cidade encantadora.`;
}

// ==================== ROTA PRINCIPAL ====================
export async function POST() {
  try {
    console.log('\n🔍 INICIANDO ANÁLISE DE CIDADES...\n');

    // 1. Busca todas as cidades
    const cities = await db.city.findMany();
    console.log(`📍 ${cities.length} cidades encontradas no banco\n`);

    let updated = 0;
    let deleted = 0;
    let skipped = 0;
    const seenNames = new Set<string>();

    for (const city of cities) {
      console.log(`\n🏙️  Analisando: "${city.name}"`);

      // Verifica duplicata (nome já processado)
      const normalizedName = city.name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) {
        // Duplicata: deleta
        await db.city.delete({ where: { id: city.id } });
        console.log(`🗑️  Duplicata removida: "${city.name}"`);
        deleted++;
        continue;
      }
      seenNames.add(normalizedName);

      // 2. Analisa se é realmente uma cidade
      const analysis = await analyzeIfCity(city.name);

      if (analysis.isCity && analysis.cityName.toLowerCase() === city.name.toLowerCase()) {
        console.log(`✅ Já é uma cidade válida: "${city.name}"`);
        skipped++;
        continue;
      }

      // 3. Não é cidade ou foi renomeada
      console.log(`⚠️  Não é cidade: "${city.name}" → "${analysis.cityName}" (${analysis.reason})`);

      // Busca a cidade real
      const newCityName = analysis.cityName;
      const state = analysis.state || 'SP';

      // Verifica se a cidade real já existe no banco
      const existing = await db.city.findFirst({
        where: { name: { equals: newCityName, mode: 'insensitive' } }
      });

      if (existing) {
        // Já existe: deleta este perfil incorreto
        await db.city.delete({ where: { id: city.id } });
        console.log(`🗑️  Perfil incorreto removido (cidade real já existe): "${newCityName}"`);
        deleted++;
        continue;
      }

      // 4. Busca coordenadas e estado via Geoapify
      const coords = await getCityCoordinates(newCityName);
      const finalState = coords?.state || state;
      const finalCityName = coords?.displayName || newCityName;

      if (!coords) {
        // Não encontrou a cidade no Geoapify: deleta
        await db.city.delete({ where: { id: city.id } });
        console.log(`🗑️  Cidade não localizada no mapa: "${city.name}" → "${newCityName}"`);
        deleted++;
        continue;
      }

      // 5. Busca novas imagens
      const images = await getCityImages(finalCityName, finalState);
      const coverImage = images[0] || city.coverImage;
      const profileImage = images[1] || coverImage;

      // 6. Gera nova descrição
      const description = await generateCityDescription(finalCityName, finalState);

      // 7. Determina se é turística
      const isTouristic = await analyzeIfTouristic(finalCityName, finalState);

      // 8. Atualiza o registro
      await db.city.update({
        where: { id: city.id },
        data: {
          name: finalCityName,
          state: finalState,
          description: description,
          coverImage: coverImage || `https://source.unsplash.com/800x600/?${encodeURIComponent(finalCityName)},city`,
          profileImage: profileImage || `https://source.unsplash.com/400x400/?${encodeURIComponent(finalCityName)},city`,
          galleryImages: images,
          featured: isTouristic,
        },
      });

      console.log(`🔄 Atualizado: "${city.name}" → "${finalCityName}" (${finalState})`);
      updated++;

      // Pausa para não sobrecarregar APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ ANÁLISE CONCLUÍDA:`);
    console.log(`   ${updated} cidades atualizadas`);
    console.log(`   ${deleted} perfis removidos`);
    console.log(`   ${skipped} cidades já válidas`);
    console.log('='.repeat(50) + '\n');

    return NextResponse.json({
      success: true,
      message: `Análise concluída: ${updated} atualizadas, ${deleted} removidas, ${skipped} mantidas.`,
      stats: { updated, deleted, skipped },
    });
  } catch (error: any) {
    console.error('❌ Erro na análise:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function analyzeIfTouristic(cityName: string, state: string): Promise<boolean> {
  const groq = await getGroqClient();
  if (!groq) return false;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Responda apenas "true" ou "false".' },
        { role: 'user', content: `${cityName}, ${state} é uma cidade turística?` }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 10,
    });
    return completion.choices[0]?.message?.content?.toLowerCase().includes('true');
  } catch (e) {}
  return false;
}
