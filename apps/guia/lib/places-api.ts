import { getProviderKey } from "./keys";

export async function geocodeCity(cityInfo: string) {
  const apiKey = await getProviderKey("GOOGLE_MAPS_API_KEY") || await getProviderKey("GOOGLE_MAPS");
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityInfo)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error_message) {
    throw new Error(data.error_message);
  }
  if (data.results && data.results.length > 0) {
    return data.results[0].geometry.location; // { lat, lng }
  }
  throw new Error("Cidade não encontrada");
}

export async function searchNearbyPlaces(lat: number, lng: number, type: string, radius: number = 10000) {
  const apiKey = await getProviderKey("GOOGLE_MAPS_API_KEY") || await getProviderKey("GOOGLE_MAPS");
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  
  const body = {
    includedTypes: [type],
    maxResultCount: 20, // Limite para exibir preview sem custo excessivo
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius // em metros
      }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey!,
      // Otimização financeira: Pedir só os dados vitais para a listagem (preview)
      'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours.openNow'
    },
    body: JSON.stringify(body)
  });

  return await res.json();
}

export async function searchPlaceByText(textQuery: string) {
  const apiKey = await getProviderKey("GOOGLE_MAPS_API_KEY") || await getProviderKey("GOOGLE_MAPS");
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const body = {
    textQuery: textQuery,
    maxResultCount: 1, // Queremos o melhor resultado top 1
    languageCode: "pt-BR"
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
    },
    body: JSON.stringify(body)
  });

  return await res.json();
}

export async function getPlaceDetails(placeId: string) {
  const apiKey = await getProviderKey("GOOGLE_MAPS_API_KEY") || await getProviderKey("GOOGLE_MAPS");
  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=pt-BR`;
  
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey!,
      // Field Mask completa mas isolando atributos caros desnecessários
      'X-Goog-FieldMask': '*' 
    }
  });

  return await res.json();
}

// Faz download da foto da API do Google, sobe pro GitHub e retorna a URL pública jsDelivr!
export async function downloadAndUploadPhoto(photoName: string, placeId: string): Promise<string> {
  const mapsApiKey = await getProviderKey("GOOGLE_MAPS_API_KEY") || await getProviderKey("GOOGLE_MAPS");
  const githubToken = await getProviderKey("GITHUB_ACCESS_TOKEN") || await getProviderKey("GITHUB_TOKEN");
  
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&key=${mapsApiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro ao baixar imagem do Google");
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Nome único
  const destFileName = `places/${placeId}/${new Date().getTime()}.jpg`;
  
  // Se não temos token do GitHub, retorna a URL nativa do Google.
  if (!githubToken) {
    return url;
  }
  
  const repoOwner = "luiscastropess-del";
  const repoName = "Holambra-Imagens";
  const githubUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${destFileName}`;
  const base64Content = buffer.toString('base64');

  try {
    const githubRes = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload foto ${placeId}`,
        content: base64Content,
      })
    });

    if (!githubRes.ok) {
       throw new Error(`GitHub API error: ${githubRes.status}`);
    }
    
    // Retorna URL via jsDelivr CDN
    return `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@main/${destFileName}`;
  } catch (error) {
    console.warn(`[GitHub Upload Warning] Falha ao fazer upload da imagem para ${placeId}. Usando URL nativa do Google. Erro:`, error);
    return url;
  }
}
