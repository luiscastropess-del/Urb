import { NextResponse } from 'next/server';
import { geocodeCity, searchNearbyPlaces } from '@/lib/places-api';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { city, category, radius } = await req.json();

    // 1. Pega Coordenadas
    const location = await geocodeCity(city);
    
    // 2. Busca no Google
    const placesResponse = await searchNearbyPlaces(location.lat, location.lng, category, radius * 1000);
    
    if (placesResponse.error) {
      return NextResponse.json({ error: placesResponse.error.message || "Erro na Places API" }, { status: 400 });
    }

    if (!placesResponse.places) return NextResponse.json({ places: [] });

    // 3. Checa Duplicatas contra nosso PostgreSQL via Prisma
    const googIds = placesResponse.places.map((p: any) => p.id);
    const existingPlaces = await db.place.findMany({
      where: { googlePlaceId: { in: googIds } },
      select: { googlePlaceId: true }
    });
    
    const existingIds = new Set(existingPlaces.map(ep => ep.googlePlaceId));

    // 4. Mapeia e marca quem já está no banco
    const mappedPlaces = placesResponse.places.map((p: any) => ({
      id: p.id,
      name: p.displayName?.text || 'Sem Nome',
      category: category,
      rating: p.rating || 0,
      reviews: p.userRatingCount || 0,
      address: p.formattedAddress || '',
      priceLevel: p.priceLevel || null,
      openNow: p.currentOpeningHours?.openNow || false,
      alreadyImported: existingIds.has(p.id)
    }));

    return NextResponse.json({ places: mappedPlaces });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
