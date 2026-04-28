import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Lista de IDs não fornecida' }, { status: 400 });
    }

    // Busca as chaves de API do banco de dados
    const [googleMapsKey, geminiKey] = await Promise.all([
      getProviderKey('GOOGLE_MAPS_API_KEY'),
      getProviderKey('GEMINI')
    ]);

    // Inicializa o cliente Gemini com o modelo 1.5 Pro
    let aiClient: GoogleGenAI | null = null;
    if (geminiKey) {
      aiClient = new GoogleGenAI({ apiKey: geminiKey });
      console.log('Cliente Gemini inicializado com sucesso.');
    } else {
      console.warn('Chave GEMINI não encontrada. Pulando enriquecimento com IA.');
    }

    const places = await db.place.findMany({
      where: { id: { in: ids } }
    });

    let successCount = 0;

    for (const place of places) {
      console.log(`Processando: ${place.name} (${place.id})`);
      let enrichedData: any = {};

      // 1. Enriquecimento com Google Maps (se a chave existir)
      if (googleMapsKey) {
        try {
          console.log(`[${place.name}] Buscando dados no Google Places...`);
          // Usa o endereço atual como base, se existir
          const queryAddress = place.address || `${place.name} ${place.city || ''}`;
          const encodedQuery = encodeURIComponent(queryAddress);
          
          // Busca de texto para encontrar o Place ID
          const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${googleMapsKey}`;
          console.log(`[${place.name}] Chamando Google Text Search: ${searchUrl}`);
          
          const searchRes = await fetch(searchUrl);
          const searchData = await searchRes.json();
          
          if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
            console.error(`[${place.name}] Google Text Search falhou: ${searchData.status} - ${searchData.error_message}`);
          }

          if (searchData.results && searchData.results.length > 0) {
            const googlePlaceId = searchData.results[0].place_id;
            console.log(`[${place.name}] Place ID encontrado: ${googlePlaceId}`);

            // Obtém os detalhes completos do lugar
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&key=${googleMapsKey}&language=pt-BR`;
            console.log(`[${place.name}] Chamando Google Place Details: ${detailsUrl}`);
            
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            if (detailsData.status === 'OK' && detailsData.result) {
              const r = detailsData.result;
              console.log(`[${place.name}] Dados do Google recebidos com sucesso.`);
              
              // Preenche apenas se os campos estiverem vazios no banco
              if (!place.address && r.formatted_address) {
                enrichedData.address = r.formatted_address;
                console.log(`[${place.name}] Endereço preenchido pelo Google.`);
              }
              if (!place.phone && r.formatted_phone_number) {
                enrichedData.phone = r.formatted_phone_number;
                enrichedData.internationalPhone = r.international_phone_number;
                console.log(`[${place.name}] Telefone preenchido pelo Google.`);
              }
              if (!place.website && r.website) {
                enrichedData.website = r.website;
                console.log(`[${place.name}] Website preenchido pelo Google.`);
              }
              if (!place.rating && r.rating) {
                enrichedData.rating = r.rating;
                enrichedData.userRatingsTotal = r.user_ratings_total || 0;
                console.log(`[${place.name}] Rating preenchido pelo Google: ${r.rating}`);
              }
              // CEP e Bairro estão em address_components
              if (r.address_components) {
                for (const component of r.address_components) {
                  if (component.types.includes('postal_code')) {
                    enrichedData.cep = component.long_name;
                    console.log(`[${place.name}] CEP encontrado: ${enrichedData.cep}`);
                  }
                }
              }
            } else {
              console.warn(`[${place.name}] Google Place Details falhou: ${detailsData.status}`);
            }
          } else {
            console.log(`[${place.name}] Nenhum resultado encontrado no Google Places.`);
          }
        } catch (error: any) {
          console.error(`[${place.name}] Erro ao enriquecer com Google:`, error.message);
        }
      }

      // 2. Enriquecimento com Gemini 1.5 Pro
      if (aiClient) {
        try {
          console.log(`[${place.name}] Gerando descrição e categorias com Gemini...`);
          
          // Instrução para a IA gerar uma descrição e categorias
          const prompt = `Você é um assistente de turismo especializado em Holambra, SP. 
          Gere uma descrição publicitária e atraente em português (Brasil) para o seguinte estabelecimento:
          
          Nome: ${place.name}
          Endereço: ${place.address || 'Não informado'}
          Categoria: ${place.type || 'Estabelecimento'}
          
          A descrição deve ter no máximo 300 caracteres e destacar os pontos fortes do local.
          
          Além disso, sugira de 3 a 5 categorias que melhor descrevem este estabelecimento.
          
          Retorne ESTRITAMENTE um JSON válido, sem comentários ou texto adicional, no seguinte formato:
          {
            "description": "descrição atraente em pt-br",
            "categories": ["categoria1", "categoria2", "categoria3"]
          }`;

          console.log(`[${place.name}] Enviando prompt para Gemini 1.5 Pro...`);
          const result = await aiClient.models.generateContent({
            model: "gemini-1.5-pro",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          
          if (result.text) {
            const aiData = JSON.parse(result.text);
            console.log(`[${place.name}] Resposta da Gemini:`, result.text.substring(0, 200));
            
            if (aiData.description) {
              enrichedData.description = aiData.description;
              console.log(`[${place.name}] Descrição gerada com sucesso.`);
            }
            if (aiData.categories && Array.isArray(aiData.categories)) {
              enrichedData.types = Array.from(new Set([...(place.types || []), ...aiData.categories]));
              console.log(`[${place.name}] Categorias geradas:`, enrichedData.types);
            }
          }
        } catch (error: any) {
          console.error(`[${place.name}] Erro ao enriquecer com Gemini:`, error.message);
        }
      }

      // 3. Atualiza o lugar no banco de dados se houver dados enriquecidos
      if (Object.keys(enrichedData).length > 0) {
        console.log(`[${place.name}] Atualizando banco de dados com dados enriquecidos...`, Object.keys(enrichedData));
        await db.place.update({
          where: { id: place.id },
          data: enrichedData
        });
        successCount++;
        console.log(`[${place.name}] Atualizado com sucesso!`);
      } else {
        console.log(`[${place.name}] Nenhum dado novo para enriquecer.`);
      }
    }

    console.log(`Enriquecimento concluído. ${successCount} lugares atualizados.`);
    return NextResponse.json({ success: true, message: `${successCount} lugares enriquecidos com sucesso!` });
  } catch (error: any) {
    console.error('Erro ao enriquecer lugares:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
