import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { extractCityFromAddress } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const place = await req.json();

    if (!place.osm_id) {
       return NextResponse.json({ success: false, error: "Local inválido ou sem ID." });
    }

    // Evitar duplicatas
    const exists = await db.place.findUnique({ where: { googlePlaceId: place.osm_id } });
    if (exists) {
      return NextResponse.json({ success: true, message: "Já existia" });
    }

    // Validação de Cidade
    const extractedCity = extractCityFromAddress(place.address);
    const finalCity = extractedCity || place.city || "Desconhecido";

    const created = await db.place.create({
      data: {
        googlePlaceId: place.osm_id,
        name: place.name || "Sem Nome",
        address: place.address || null,
        rating: place.rating || 0.0,
        phone: place.phone || null,
        internationalPhone: place.phone || null,
        website: place.website || null,
        type: place.category || "Estabelecimento",
        types: place.category ? [place.category] : [],
        city: finalCity,
        state: place.state || null,
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

    return NextResponse.json({ success: true, place: created });
  } catch (error: any) {
    console.error("Erro no import-prospect:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
