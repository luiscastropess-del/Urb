import { NextResponse } from 'next/server';
import { db } from '@urb/shared';
import { getProviderKey } from '@/lib/keys';

// ==================== BUSCAR IMAGENS ====================
async function getCityImages(cityName: string, state?: string): Promise<string[]> {
  const images: string[] = [];
  const headers = { 'User-Agent': 'UrbAdmin/1.0 (https://github.com/luiscastropess-del/Urb)' };

  // Wikimedia Commons
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cityName + ' ' + (state || '') + ' cidade')}&srnamespace=6&srlimit=5&format=json&origin=*`;
    const res = await fetch(searchUrl, { headers });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.query?.search) {
        for (const item of data.query.search) {
          const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&pageids=${item.pageid}&format=json&origin=*`;
          const imgRes = await fetch(imgUrl, { headers });
          if (imgRes.ok) {
            const imgData = await imgRes.json().catch(() => null);
            const page = imgData?.query?.pages?.[item.pageid];
            if (page?.imageinfo?.[0]?.url) images.push(page.imageinfo[0].url);
          }
        }
      }
    }
  } catch (e) {}

  // OSM image tag
  try {
    const osmQuery = `[out:json]; area["name"="${cityName}"]; node(area)["tourism"][image]; out body 3;`;
    const osmUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`;
    const osmRes = await fetch(osmUrl);
    if (osmRes.ok) {
      const osmData = await osmRes.json().catch(() => null);
      if (osmData?.elements) {
        for (const el of osmData.elements) {
          if (el.tags?.image && !images.includes(el.tags.image)) images.push(el.tags.image);
        }
      }
    }
  } catch (e) {}

  // Geoapify (se tiver placeId salvo)
  try {
    const apiKey = await getProviderKey('GEOAPIFY_API');
    if (apiKey) {
      const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName + ', Brasil')}&format=json&apiKey=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json().catch(() => null);
      if (geoData?.results?.length > 0) {
        const placeId = geoData.results[0].place_id;
        if (placeId) {
          const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json().catch(() => null);
          const props = detailsData?.features?.[0]?.properties;
          if (props) {
            if (props.photo_urls) images.push(...props.photo_urls);
            if (props.logo_url) images.push(props.logo_url);
            if (props.icon_url) images.push(props.icon_url);
          }
        }
      }
    }
  } catch (e) {}

  return [...new Set(images)].slice(0, 5);
}

// ==================== ROTA PRINCIPAL ====================
export async function POST(req: Request) {
  try {
    const { cityId } = await req.json().catch(() => ({}));

    let cities;
    if (cityId) {
      const city = await db.city.findUnique({ where: { id: cityId } });
      if (!city) {
        return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });
      }
      cities = [city];
    } else {
      cities = await db.city.findMany();
    }

    console.log(`\n🖼️  ATUALIZANDO IMAGENS DE ${cities.length} CIDADES...\n`);

    let updated = 0;
    let failed = 0;

    for (const city of cities) {
      console.log(`  📸 ${city.name}...`);
      try {
        const images = await getCityImages(city.name, city.state || undefined);
        
        if (images.length > 0) {
          const coverImage = images[0];
          const profileImage = images.length > 1 ? images[1] : images[0];
          
          await db.city.update({
            where: { id: city.id },
            data: {
              coverImage,
              profileImage,
              galleryImages: images,
            },
          });
          
          console.log(`    ✅ ${images.length} imagens atualizadas`);
          updated++;
        } else {
          console.log(`    ⚠️ Nenhuma imagem encontrada`);
          failed++;
        }
      } catch (error: any) {
        console.error(`    ❌ Erro: ${error.message}`);
        failed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n✅ RESULTADO: ${updated} atualizadas, ${failed} falhas\n`);

    return NextResponse.json({
      success: true,
      message: `${updated} cidades atualizadas, ${failed} falhas.`,
      stats: { updated, failed },
    });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
