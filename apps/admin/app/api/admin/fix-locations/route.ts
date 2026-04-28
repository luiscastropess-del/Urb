import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { extractCityFromAddress } from '@/lib/utils';

export async function GET() {
  try {
    const places = await db.place.findMany({
      where: {
        address: { not: null },
        city: { not: null }
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true
      }
    });

    let correctedCount = 0;
    const corrections = [];

    for (const place of places) {
      const extractedCity = extractCityFromAddress(place.address);
      
      if (extractedCity && extractedCity.toLowerCase() !== place.city?.toLowerCase()) {
        // Correção necessária
        await db.place.update({
          where: { id: place.id },
          data: { city: extractedCity }
        });
        
        corrections.push({
          id: place.id,
          name: place.name,
          oldCity: place.city,
          newCity: extractedCity,
          address: place.address
        });
        correctedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Análise concluída. ${correctedCount} locais corrigidos.`,
      corrections
    });

  } catch (error: any) {
    console.error("Erro no script de correção de cidades:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
