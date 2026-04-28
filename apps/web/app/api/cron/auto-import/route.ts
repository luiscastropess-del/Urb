import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { extractCityFromAddress } from '@/lib/utils';

// Revalidar sempre no Vercel/Next.js para evitar cache no endpoint de cron
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Busca dados da API Externa
    const res = await fetch("http://34.151.205.86:3000/api/result", { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Falha ao buscar na API: ${res.statusText}` }, { status: 502 });
    }

    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
       return NextResponse.json({ success: true, message: "Nenhum dado novo para importar. Lista vazia." });
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const place of data) {
      if (!place.osm_id) {
        errorCount++;
        continue;
      }

      // Evitar duplicatas (usando o googlePlaceId como container para o osm_id como fizemos antes)
      const exists = await db.place.findUnique({ where: { googlePlaceId: place.osm_id } });
      if (exists) {
        skippedCount++;
        continue;
      }

      // Validação de Cidade Rigorosa
      const extractedCity = extractCityFromAddress(place.address);
      const finalCity = extractedCity || place.city || "Desconhecido";

      try {
        await db.place.create({
          data: {
            googlePlaceId: place.osm_id,
            name: place.name || "Sem Nome",
            address: place.address || null,
            city: finalCity,
            state: place.state || null,
            rating: place.rating ? parseFloat(place.rating.toString()) : 0.0,
            phone: place.phone || null,
            internationalPhone: place.phone || null,
            website: place.website || null,
            type: place.category || "Estabelecimento",
            types: place.category ? [place.category] : [],
            coverImage: place.photo_url || null,
            profileImage: place.photo_url || null,
            
            openingHours: place.opening_hours ? {
               create: {
                 openNow: false,
                 weekdayText: typeof place.opening_hours === "string" ? [place.opening_hours] : place.opening_hours
               }
            } : undefined
          }
        });
        successCount++;
      } catch (err) {
        console.error(`Erro ao importar local ${place.osm_id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Importação automática concluída.`, 
      stats: {
        imported: successCount,
        skipped_already_exists: skippedCount,
        errors_or_invalid: errorCount,
        total_received: data.length
      }
    });

  } catch (error: any) {
    console.error("Erro no cron de auto-importação:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
