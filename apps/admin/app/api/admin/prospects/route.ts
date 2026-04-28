import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const places = await db.place.findMany({
      include: {
        photos: true,
        googleReviews: true,
        openingHours: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const enrichedPlaces = places.map((place) => {
      let score = 0;
      let totalFields = 8;
      
      if (place.name) score += 1;
      if (place.address || place.city) score += 1;
      if (place.phone || place.internationalPhone) score += 1;
      if (place.website) score += 1;
      if (place.coverImage || place.profileImage || place.photos.length > 0) score += 1;
      if (place.rating) score += 1;
      if (place.openingHours) score += 1;
      if (place.googleReviews && place.googleReviews.length > 0) score += 1;

      const completeness = Math.round((score / totalFields) * 100);

      return {
        ...place,
        completeness
      };
    });

    return NextResponse.json({ success: true, places: enrichedPlaces });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
