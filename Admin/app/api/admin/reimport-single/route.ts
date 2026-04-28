import { NextResponse } from 'next/server';
import { getPlaceDetails, downloadAndUploadPhoto } from '@/lib/places-api';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const existingPlace = await db.place.findUnique({
      where: { id },
      include: {
        photos: true,
        googleReviews: true,
        openingHours: true,
      }
    });

    if (!existingPlace) {
      return NextResponse.json({ error: "Local não encontrado" }, { status: 404 });
    }

    if (!existingPlace.googlePlaceId && !existingPlace.name) {
      return NextResponse.json({ error: "Local não possui ID do Google nem Nome válido para busca." }, { status: 400 });
    }

    let targetGooglePlaceId = existingPlace.googlePlaceId;

    // Se o googlePlaceId for puramente numérico (como OSM ID) ou inexistente,
    // usamos o searchPlaceByText para achar o verdadeiro ID do Google.
    if (!targetGooglePlaceId || /^\d+$/.test(targetGooglePlaceId)) {
      const { searchPlaceByText } = await import('@/lib/places-api');
      const queryText = `${existingPlace.name} ${existingPlace.address || existingPlace.city || ''}`.trim();
      
      const searchRes = await searchPlaceByText(queryText);
      if (searchRes.places && searchRes.places.length > 0) {
        targetGooglePlaceId = searchRes.places[0].id;
      } else {
        return NextResponse.json({ error: "Não foi possível encontrar este local no Google Places para enriquecer." }, { status: 404 });
      }
    }

    if (!targetGooglePlaceId) {
      return NextResponse.json({ error: "Falha na conversão e aquisição do ID do Google Places." }, { status: 400 });
    }

    // 1. Buscar detalhes brutos (Full Detail)
    const details = await getPlaceDetails(targetGooglePlaceId);
    
    // Pegar CEP e Descrição
    const postalCodeComponent = details.addressComponents?.find((c: any) => c.types.includes("postal_code"));
    const cep = postalCodeComponent ? postalCodeComponent.shortText : undefined;
    const description = details.editorialSummary?.text || null;

    // 2. Prepara atualização apenas do que falta
    const updateData: any = {};
    
    if (!existingPlace.address && details.formattedAddress) updateData.address = details.formattedAddress;
    if (!existingPlace.cep && cep) updateData.cep = cep; // <-- CEP
    if (!existingPlace.phone && details.nationalPhoneNumber) updateData.phone = details.nationalPhoneNumber;
    if (!existingPlace.internationalPhone && details.internationalPhoneNumber) updateData.internationalPhone = details.internationalPhoneNumber;
    if (!existingPlace.website && details.websiteUri) updateData.website = details.websiteUri;
    if ((!existingPlace.rating || existingPlace.rating === 0) && details.rating) updateData.rating = details.rating;
    if ((!existingPlace.userRatingsTotal || existingPlace.userRatingsTotal === 0) && details.userRatingCount) updateData.userRatingsTotal = details.userRatingCount;
    if (!existingPlace.priceLevel && details.priceLevel) updateData.priceLevel = details.priceLevel;
    if ((!existingPlace.types || existingPlace.types.length === 0) && details.types) updateData.types = details.types;
    if (!existingPlace.type && details.primaryTypeDisplayName?.text) updateData.type = details.primaryTypeDisplayName.text;
    if (!existingPlace.editorialSummary && details.editorialSummary?.text) updateData.editorialSummary = details.editorialSummary.text;
    if (!existingPlace.description && description) updateData.description = description;

    let coverImageUrl = existingPlace.coverImage;
    let profileImageUrl = existingPlace.profileImage;

    // Photos - baixar apenas se não tiver
    if (existingPlace.photos.length === 0 && details.photos) {
      const uploadedPhotos = [];
      const photosToProcess = details.photos.slice(0, 5); 
      for (const ph of photosToProcess) {
         try {
           const url = await downloadAndUploadPhoto(ph.name, targetGooglePlaceId);
           uploadedPhotos.push({
             url,
             googleRef: ph.name,
             htmlAttributions: ph.authorAttributions?.map((a:any) => a.displayName) || []
           });
         } catch(e) { console.error("Erro na foto", e) }
      }
      if (uploadedPhotos.length > 0) {
        updateData.photos = { create: uploadedPhotos };
        if (!coverImageUrl) coverImageUrl = uploadedPhotos[0].url;
        if (!profileImageUrl) profileImageUrl = uploadedPhotos.length > 1 ? uploadedPhotos[1].url : coverImageUrl;
      }
    }

    if (!existingPlace.coverImage && coverImageUrl) {
        updateData.coverImage = coverImageUrl;
    }
    if (!existingPlace.profileImage && profileImageUrl) {
        updateData.profileImage = profileImageUrl;
    }

    // Horários de funcionamento
    if (!existingPlace.openingHours && details.currentOpeningHours) {
        updateData.openingHours = {
           create: {
             openNow: details.currentOpeningHours.openNow || false,
             weekdayText: details.currentOpeningHours.weekdayDescriptions || []
           }
        };
    }

    // Avaliações do Google
    if (existingPlace.googleReviews.length === 0 && details.reviews) {
        updateData.googleReviews = {
           create: details.reviews.slice(0, 5).map((r:any) => ({
              authorName: r.authorAttribution?.displayName || "Anônimo",
              authorPhotoUrl: r.authorAttribution?.photoUri,
              rating: r.rating,
              text: r.text?.text || "",
              relativePublishTime: r.relativePublishTimeDescription
           }))
        };
    }

    if (Object.keys(updateData).length > 0) {
        const updated = await db.place.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json({ success: true, message: "Local sincronizado com dados adicionais do Google", place: updated });
    } else {
        return NextResponse.json({ success: true, message: "Todas as informações já estão atualizadas.", place: existingPlace });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
