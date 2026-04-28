import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { searchPlaceByText, getPlaceDetails } from '@/lib/places-api';
import { GoogleGenAI } from '@google/genai';

import { getProviderKey } from '@/lib/keys';

export async function POST(req: Request) {
  try {
    const mapsKey = await getProviderKey("GOOGLE_MAPS") || await getProviderKey("GOOGLE_MAPS_API_KEY") || process.env.GOOGLE_MAPS_API_KEY;
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Lista de IDs não fornecida' }, { status: 400 });
    }

    const places = await db.place.findMany({
      where: { id: { in: ids } }
    });

    const apiKeyRecord = await db.apiKey.findUnique({
      where: { provider: 'GEMINI' }
    });

    // Uses NEXT_PUBLIC_GEMINI_API_KEY from environment, or from DB if available.
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || apiKeyRecord?.key;

    let aiClient: GoogleGenAI | null = null;
    if (geminiKey) {
      aiClient = new GoogleGenAI({ apiKey: geminiKey });
    }

    let successCount = 0;
    
    for (const place of places) {
      try {
        const queryStr = `${place.name} ${place.address || ''} ${place.city || ''}`;
        
        let enrichedData: any = {};

        // 1. Buscando via API do Google (Places) para os detalhes mais precisos e imagens/comentários oficiais
        const searchRes = await searchPlaceByText(queryStr);
        if (searchRes && searchRes.places && searchRes.places.length > 0) {
          const googlePlaceId = searchRes.places[0].id;
          const details = await getPlaceDetails(googlePlaceId);
          
          if (details) {
             const r = details;
             enrichedData.phone = r.nationalPhoneNumber || r.internationalPhoneNumber || place.phone;
             enrichedData.internationalPhone = r.internationalPhoneNumber || place.internationalPhone;
             enrichedData.website = r.websiteUri || place.website;
             enrichedData.rating = r.rating || place.rating;
             enrichedData.userRatingsTotal = r.userRatingCount || place.userRatingsTotal;
             enrichedData.address = r.formattedAddress || place.address;
             
             // Extract images (urls)
             if (r.photos && r.photos.length > 0) {
                // Not downloading binaries, just getting the raw Google Places API URL
                // Note: these URLs require a key to view without downloading, but we just save it.
                // Or we can just use the downloadAndUploadPhoto function which handles GitHub CDN.
                const photoName = r.photos[0].name;
                // Avoid using mapsApiKey here by relying on the client side rendering or our API, but let's just save the name to generate the URL later
                if (!place.coverImage && mapsKey) {
                   enrichedData.coverImage = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&key=${mapsKey}`;
                }
             }
             
             if (r.editorialSummary && r.editorialSummary.text) {
                enrichedData.editorialSummary = r.editorialSummary.text;
             }

             if (r.reviews && r.reviews.length > 0) {
                // Update reviews
                for (const review of (r.reviews || []).slice(0, 5)) {
                  // Check if it exists
                  const existingReview = await db.review.findFirst({ where: { placeId: place.id, authorName: review.authorAttribution?.displayName } });
                  if (!existingReview) {
                    await db.review.create({
                      data: {
                        placeId: place.id,
                        authorName: review.authorAttribution?.displayName || 'Anônimo',
                        authorPhotoUrl: review.authorAttribution?.photoUri || '',
                        rating: review.rating || 5,
                        text: review.originalText?.text || review.text?.text || '',
                        relativePublishTime: review.relativePublishTimeDescription || ''
                      }
                    });
                  }
                }
             }

             if (r.currentOpeningHours || r.regularOpeningHours) {
                const hours = r.regularOpeningHours || r.currentOpeningHours;
                if (hours.weekdayDescriptions) {
                  await db.openingHours.upsert({
                    where: { placeId: place.id },
                    create: { placeId: place.id, weekdayText: hours.weekdayDescriptions },
                    update: { weekdayText: hours.weekdayDescriptions }
                  });
                }
             }
          }
        }

        // 2. Enriquecimento complementar via Gemini (Busca Inteligente) se o Gemini estiver configurado
        if (aiClient) {
          const prompt = `Gere uma breve descrição publicitária e atrativa e sugira 3 a 5 categorias para o estabelecimento: ${queryStr}.
          Retorne ESTRITAMENTE um JSON estruturado da seguinte forma:
          {
             "description": "descrição atraente em pt-br até 300 caracteres",
             "categories": ["restaurante", "brasileira", "pizzaria"]
          }`;

          const result = await aiClient.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          
          if (result.text) {
             const aiData = JSON.parse(result.text);
             if (aiData.description) enrichedData.description = aiData.description;
             if (aiData.categories && Array.isArray(aiData.categories)) {
               enrichedData.types = Array.from(new Set([...(place.types || []), ...aiData.categories]));
             }
          }
        }

        await db.place.update({
          where: { id: place.id },
          data: enrichedData
        });
        
        successCount++;

      } catch (err: any) {
        console.error(`Erro ao enriquecer local ${place.id}:`, err.message);
      }
    }

    return NextResponse.json({ success: true, message: `${successCount} lugares enriquecidos com sucesso!` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
