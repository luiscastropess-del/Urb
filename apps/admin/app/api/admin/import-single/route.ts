import { NextResponse } from 'next/server';
import { getPlaceDetails, downloadAndUploadPhoto } from '@/lib/places-api';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { placeId, city, state } = await req.json();

    // 1. Verifica se deu duplicidade de corrida
    const exists = await db.place.findUnique({ where: { googlePlaceId: placeId } });
    if (exists) return NextResponse.json({ message: "Já existe" });

    // Pegar detalhes brutos (Full Detail)
    const details = await getPlaceDetails(placeId);
    
    // Pegar Cidade Real dos addressComponents
    const cityComponent = details.addressComponents?.find((c: any) => c.types.includes("locality"));
    const realCity = cityComponent ? cityComponent.longText : city; // Fallback para o input se não achar

    // Pegar CEP (Postal Code)
    const postalCodeComponent = details.addressComponents?.find((c: any) => c.types.includes("postal_code"));
    const cep = postalCodeComponent ? postalCodeComponent.longText || postalCodeComponent.shortText : undefined;

    // Pegar descrição (editorialSummary ou descrição do displayName se houver)
    const description = details.editorialSummary?.text || details.displayName?.text || null;

    // 3. Construir transação complexa de Imagens
    const uploadedPhotos = [];
    if (details.photos) {
      // Limita a 5 fotos para otimizar custo de storage/rede
      const photosToProcess = details.photos.slice(0, 5); 
      for (const ph of photosToProcess) {
         try {
           const url = await downloadAndUploadPhoto(ph.name, placeId);
           uploadedPhotos.push({
             url,
             googleRef: ph.name,
             htmlAttributions: ph.authorAttributions?.map((a:any) => a.displayName) || []
           });
         } catch(e) { console.error("Erro na foto", e) }
      }
    }

    // Perfil costuma ser a primeira imagem ou o logo oficial. Capa a segunda.
    const profileImageUrl = uploadedPhotos.length > 0 ? uploadedPhotos[0].url : "";
    const coverImageUrl = uploadedPhotos.length > 1 ? uploadedPhotos[1].url : profileImageUrl;

    // 4. Commit completo via Transação
    const created = await db.place.create({
      data: {
        googlePlaceId: details.id,
        name: details.displayName?.text,
        city: realCity, // Validado via Google API
        state: state, // Opcional, traduzido no frontend
        address: details.formattedAddress,
        cep: cep, // <-- Novo campo adicionado
        phone: details.nationalPhoneNumber,
        internationalPhone: details.internationalPhoneNumber,
        website: details.websiteUri,
        rating: details.rating || 0.0,
        userRatingsTotal: details.userRatingCount || 0,
        priceLevel: details.priceLevel,
        types: details.types || [],
        type: details.primaryTypeDisplayName?.text || "Estabelecimento",
        editorialSummary: description,
        description: description, // <-- Novo campo adicionado
        coverImage: coverImageUrl,
        profileImage: profileImageUrl, // <-- Novo campo adicionado
        
        photos: {
           create: uploadedPhotos
        },
        
        openingHours: details.currentOpeningHours ? {
           create: {
             openNow: details.currentOpeningHours.openNow || false,
             weekdayText: details.currentOpeningHours.weekdayDescriptions || []
           }
        } : undefined,

        googleReviews: details.reviews ? {
           create: details.reviews.slice(0, 5).map((r:any) => ({
              authorName: r.authorAttribution?.displayName || "Anônimo",
              authorPhotoUrl: r.authorAttribution?.photoUri,
              rating: r.rating,
              text: r.text?.text || "",
              relativePublishTime: r.relativePublishTimeDescription
           }))
        } : undefined
      }
    });

    return NextResponse.json({ success: true, place: created });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
