import { NextResponse } from 'next/server';
import { searchOverpass, savePlacesToDb } from '@/lib/prospector-api';
import { setResultBuffer } from '@/lib/prospector-buffer';

const CITIES = [
  "São Paulo", "Curitiba", "Holambra", "Gramado", "Rio de Janeiro", 
  "Florianópolis", "Belo Horizonte", "Salvador", "Fortaleza", "Recife", 
  "Porto Alegre", "Brasília", "Campinas", "Santos", "Joinville", 
  "Ribeirão Preto", "Blumenau", "Balneário Camboriú", "Petrópolis", "Paraty"
];

const CATEGORIES = [
  "restaurant", "hotel", "cafe", "mechanic", "bakery", 
  "pharmacy", "supermarket", "park", "school", "hospital"
];

export async function GET() {
  return handleCron();
}

export async function POST() {
  return handleCron();
}

async function handleCron() {
  try {
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    console.log(`Cron disparada: Prospectando ${randomCategory} em ${randomCity}`);

    const results = await searchOverpass(randomCity, randomCategory);

    if (results.length > 0) {
      await savePlacesToDb(results);
      setResultBuffer(results);
    }

    return NextResponse.json({ 
      success: true, 
      city: randomCity, 
      category: randomCategory, 
      count: results.length 
    });
  } catch (error: any) {
    console.error("Erro na cron do prospector:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
