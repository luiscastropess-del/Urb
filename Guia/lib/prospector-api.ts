import { db } from './prisma';
import { uploadImageToGitHub } from './github-storage';

export async function searchOverpass(city: string, category: string) {
  // ... (código existente da query overpass) ...
  const query = `
    [out:json][timeout:25];
    area["name"="${city}"]["admin_level"~"4|8"]->.searchArea;
    (
      node["amenity"="${category}"](area.searchArea);
      way["amenity"="${category}"](area.searchArea);
      node["shop"="${category}"](area.searchArea);
      way["shop"="${category}"](area.searchArea);
      node["tourism"="${category}"](area.searchArea);
      way["tourism"="${category}"](area.searchArea);
      node["leisure"="${category}"](area.searchArea);
      way["leisure"="${category}"](area.searchArea);
    );
    out body center 30;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.elements) return [];

    const processedPlaces = await Promise.all(data.elements.map(async (element: any) => {
      const tags = element.tags || {};
      const name = tags.name || `Local sem nome (${element.id})`;
      const osm_id = `osm:${element.id}`;
      
      const address = [
        tags["addr:street"],
        tags["addr:housenumber"],
        tags["addr:suburb"],
        tags["addr:city"]
      ].filter(Boolean).join(", ") || "Endereço não disponível";

      let photo_url = tags.image || tags.wikimedia_commons || `https://picsum.photos/seed/${element.id}/800/600`;

      // Se for uma URL externa (não github), tenta enviar para o GitHub
      if (photo_url.startsWith('http') && !photo_url.includes('githubusercontent.com')) {
          photo_url = await uploadImageToGitHub(photo_url, `${element.id}.jpg`);
      }

      return {
        osm_id,
        name,
        category: tags.amenity || tags.shop || tags.tourism || tags.leisure || category,
        address,
        opening_hours: tags.opening_hours || "Não informado",
        phone: tags.phone || tags["contact:phone"] || "Não informado",
        website: tags.website || tags["contact:website"] || "Não informado",
        photo_url,
        city,
        state: tags["addr:state"] || ""
      };
    }));

    return processedPlaces;
  } catch (error) {
    console.error("Erro na busca Overpass:", error);
    return [];
  }
}
// ... (resto do savePlacesToDb - NÃO MODIFICAR) ...

export async function savePlacesToDb(places: any[]) {
    const saved = [];
    for (const place of places) {
        try {
            const upserted = await db.place.upsert({
                where: { osm_id: place.osm_id },
                update: {
                    name: place.name,
                    category: place.category,
                    address: place.address,
                    opening_hours: place.opening_hours,
                    phone: place.phone,
                    website: place.website,
                    photo_url: place.photo_url,
                    city: place.city,
                    last_updated: new Date()
                },
                create: {
                    osm_id: place.osm_id,
                    name: place.name,
                    category: place.category,
                    address: place.address,
                    opening_hours: place.opening_hours,
                    phone: place.phone,
                    website: place.website,
                    photo_url: place.photo_url,
                    city: place.city,
                    type: "Lugar",
                    last_updated: new Date()
                }
            });
            saved.push(upserted);
        } catch (err) {
            console.error(`Erro ao salvar/atualizar local ${place.osm_id}:`, err);
        }
    }
    return saved;
}
