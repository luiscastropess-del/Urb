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

// ==================== PRÉ-VALIDAÇÃO LOCAL (RÁPIDA) ====================
function isObviouslyNotCity(name: string): boolean {
  const lowered = name.toLowerCase().trim();
  
  // Números puros
  if (/^\d+$/.test(lowered)) return true;
  
  // CEPs
  if (/^\d{5}-\d{3}$/.test(lowered) || /^\d{8}$/.test(lowered)) return true;
  
  // Palavras-chave de logradouro
  const streetKeywords = [
    'rua ', 'rua.', 'avenida ', 'avenida.', 'alameda ', 'alameda.',
    'travessa ', 'travessa.', 'praça ', 'praça.', 'praca ', 'praca.',
    'rodovia ', 'rodovia.', 'estrada ', 'estrada.', 'quadra ', 'quadra.',
    'parque ', 'parque.', 'jardim ', 'jardim.', 'vila ', 'vila.',
    'largo ', 'largo.', 'beco ', 'beco.', 'via ', 'via.',
  ];
  
  for (const keyword of streetKeywords) {
    if (lowered.startsWith(keyword)) return true;
  }
  
  // Palavras que indicam bairro/região (não cidade)
  const nonCityKeywords = [
    'centro', 'bairro', 'distrito', 'setor', 'módulo', 'bloco',
    'região metropolitana', 'loteamento', 'condomínio', 'residencial',
  ];
  
  for (const keyword of nonCityKeywords) {
    if (lowered === keyword || lowered.endsWith(' ' + keyword)) return true;
  }
  
  return false;
}

// ==================== ANALISAR COM GROQ (RIGOROSO) ====================
async function analyzeIfCity(name: string): Promise<{
  isCity: boolean;
  cityName: string;
  state: string;
  reason: string;
}> {
  // Se for obviamente não-cidade, nem chama a IA
  if (isObviouslyNotCity(name)) {
    return {
      isCity: false,
      cityName: '',
      state: '',
      reason: 'Pré-validação: nome contém indicador de logradouro/bairro/número',
    };
  }

  const groq = await getGroqClient();
  if (!groq) {
    return { isCity: true, cityName: name, state: '', reason: 'Sem IA disponível' };
  }

  const prompt = `Você é um especialista em geografia brasileira. Analise APENAS o nome abaixo e determine:

1. Isso é o nome de uma CIDADE/MUNICÍPIO brasileiro?
2. Se SIM, qual o nome exato da cidade e qual a UF (sigla do estado)?
3. Se NÃO, qual é a CIDADE onde esse local está localizado? (ex: "Rua X" fica em "Cidade Y, UF")

REGRAS RÍGIDAS:
- Nomes que começam com "Rua", "Avenida", "Alameda", "Travessa", "Praça", "Rodovia", "Estrada", "Quadra", "Parque", "Jardim", "Vila" NÃO são cidades.
- Números puros (ex: "43", "602") NÃO são cidades.
- "Centro", "Bairro", "Região Metropolitana" NÃO são cidades.
- "ponta verde", "cabula" são BAIRROS, não cidades.
- Se for um bairro ou logradouro, encontre a CIDADE a que pertence.

Nome a analisar: "${name}"

Retorne APENAS um JSON válido:
{
  "isCity": true ou false,
  "cityName": "nome da cidade (se não for cidade, a cidade onde está localizado)",
  "state": "UF (sigla do estado)",
  "reason": "explicação curta"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um especialista em geografia brasileira. Seja RIGOROSO: ruas, avenidas, bairros NÃO são cidades. Identifique a cidade correta.' },
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
        isCity: result.isCity === true,
        cityName: result.cityName || name,
        state: result.state || '',
        reason: result.reason || '',
      };
    }
  } catch (e) {}

  return { isCity: true, cityName: name, state: '', reason: 'Falha na análise' };
}

// ==================== GEOAPIFY - CONFIRMAÇÃO ====================
async function confirmCityExists(cityName: string, state?: string): Promise<{ exists: boolean; displayName: string; state: string }> {
  const apiKey = await getProviderKey('GEOAPIFY_API');
  if (!apiKey) return { exists: true, displayName: cityName, state: state || '' };

  try {
    const query = state ? `${cityName}, ${state}, Brasil` : `${cityName}, Brasil`;
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.results?.length > 0) {
      const r = data.results[0];
      // Verifica se o resultado é realmente uma cidade (city, town, municipality)
      const isLocality = r.result_type === 'city' || r.result_type === 'town' || r.result_type === 'municipality' || r.result_type === 'administrative';
      if (isLocality || r.city) {
        return {
          exists: true,
          displayName: r.city || r.name || cityName,
          state: r.state || state || '',
        };
      }
    }
    return { exists: false, displayName: cityName, state: state || '' };
  } catch (e) {
    return { exists: true, displayName: cityName, state: state || '' };
  }
}

// ==================== BUSCAR IMAGENS ====================
async function getCityImages(cityName: string, state?: string): Promise<string[]> {
  const images: string[] = [];
  const headers = { 'User-Agent': 'UrbAdmin/1.0' };

  // Wikimedia
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
    const osmQuery = `[out:json]; area["name"="${cityName}"]; node(area)["tourism"][image]; out body 3;`;
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

// ==================== DESCRIÇÃO COM IA ====================
async function generateCityDescription(cityName: string, state: string): Promise<string> {
  const groq = await getGroqClient();
  if (!groq) return `${cityName} é um município do estado de ${state}.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um redator de turismo.' },
        { role: 'user', content: `Descreva a cidade de ${cityName}, ${state} em até 400 caracteres.` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 400,
    });
    return completion.choices[0]?.message?.content || `${cityName} é um município do estado de ${state}.`;
  } catch (e) {}
  return `${cityName} é um município do estado de ${state}.`;
}

// ==================== ROTA PRINCIPAL ====================
export async function POST() {
  try {
    console.log('\n🔍 INICIANDO ANÁLISE RIGOROSA DE CIDADES...\n');

    const cities = await db.city.findMany();
    console.log(`📍 ${cities.length} registros encontrados\n`);

    let updated = 0;
    let deleted = 0;
    let skipped = 0;
    const seenNames = new Set<string>();

    for (const city of cities) {
      console.log(`\n🏙️  [${city.name}]`);

      // Verifica duplicata pelo nome normalizado
      const normalized = city.name.toLowerCase().trim();
      if (seenNames.has(normalized)) {
        await db.city.delete({ where: { id: city.id } });
        console.log(`  🗑️  Duplicata removida`);
        deleted++;
        continue;
      }
      seenNames.add(normalized);

      // 1. Análise IA (rigorosa)
      const analysis = await analyzeIfCity(city.name);
      console.log(`  🤖 IA: isCity=${analysis.isCity}, cityName="${analysis.cityName}", reason="${analysis.reason}"`);

      if (analysis.isCity && analysis.cityName.toLowerCase() === city.name.toLowerCase()) {
        // A IA diz que é cidade e o nome está correto
        // Confirma com Geoapify
        const geo = await confirmCityExists(city.name, analysis.state);
        if (geo.exists) {
          console.log(`  ✅ Confirmado como cidade pelo Geoapify`);
          skipped++;
          continue;
        } else {
          console.log(`  ⚠️ Geoapify NÃO confirmou. Buscando cidade real...`);
          analysis.isCity = false;
        }
      }

      // 2. NÃO é cidade (ou Geoapify não confirmou)
      if (!analysis.isCity || analysis.cityName.toLowerCase() !== city.name.toLowerCase()) {
        const newCityName = analysis.cityName || city.name;
        const state = analysis.state || city.state || 'SP';

        // Busca coordenadas da cidade real
        const geo = await confirmCityExists(newCityName, state);
        const finalCityName = geo.displayName || newCityName;
        const finalState = geo.state || state;

        if (!geo.exists) {
          // Cidade não encontrada: deleta
          await db.city.delete({ where: { id: city.id } });
          console.log(`  🗑️  Removido: "${city.name}" → cidade real "${finalCityName}" não localizada`);
          deleted++;
          continue;
        }

        // Verifica se a cidade real já existe (evita duplicata)
        const dupe = await db.city.findFirst({
          where: { name: { equals: finalCityName, mode: 'insensitive' } }
        });
        if (dupe && dupe.id !== city.id) {
          await db.city.delete({ where: { id: city.id } });
          console.log(`  🗑️  Removido: "${city.name}" → "${finalCityName}" já existe`);
          deleted++;
          continue;
        }

        // Busca novas imagens
        const images = await getCityImages(finalCityName, finalState);
        const cover = images[0] || `https://source.unsplash.com/800x600/?${encodeURIComponent(finalCityName)},city`;
        const profile = images[1] || cover;

        // Nova descrição
        const description = await generateCityDescription(finalCityName, finalState);

        // Atualiza
        await db.city.update({
          where: { id: city.id },
          data: {
            name: finalCityName,
            state: finalState,
            description,
            coverImage: cover,
            profileImage: profile,
            galleryImages: images,
          },
        });

        console.log(`  🔄 Atualizado: "${city.name}" → "${finalCityName}" (${finalState})`);
        updated++;
      }

      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n✅ RESULTADO: ${updated} atualizadas | ${deleted} removidas | ${skipped} mantidas\n`);

    return NextResponse.json({
      success: true,
      message: `${updated} atualizadas, ${deleted} removidas, ${skipped} mantidas.`,
      stats: { updated, deleted, skipped },
    });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
