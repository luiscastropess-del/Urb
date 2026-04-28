import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.place.createMany({
    data: [
      { name: "Moinho Povos Unidos", emoji: "🌾", rating: 4.9, reviews: "1.2k", distance: "0.8 km", type: "Marco", featured: true },
      { name: "Bloemen Park", emoji: "🌻", rating: 4.8, reviews: "850", distance: "3.2 km", type: "Parque", featured: true },
      { name: "Boulevard Holandês", emoji: "🏠", rating: 4.7, reviews: "620", distance: "0.5 km", type: "Compras", featured: true },
      { name: "Villa Holandesa", emoji: "🍽️", rating: 4.6, reviews: "340", distance: "200m", type: "Restaurante", featured: false },
      { name: "Café com Flores", emoji: "☕", rating: 4.8, reviews: "342", distance: "1.2 km", type: "Café & Bistrô", premium: true },
    ]
  })

  await prisma.event.createMany({
    data: [
      { name: "Expoflora 2026", emoji: "🌸🌷🌻", type: "Flores", gradient: "from-pink-300 via-rose-400 to-orange-400", date: "22 Ago - 21 Set", time: "9h - 19h", loc: "Al. Maurício de Nassau, 800", featured: true },
      { name: "Festival Gastronômico", emoji: "🍽️🧀🍷", type: "Gastronomia", gradient: "from-amber-200 to-orange-300", date: "15 - 17 Ago", time: "11h - 22h", loc: "Praça dos Moinhos", featured: false },
    ]
  })

  try {
    const moinhoObj = await prisma.place.findFirst({ where: { name: "Moinho Povos Unidos" } });
    const parqueObj = await prisma.place.findFirst({ where: { name: "Bloemen Park" } });

    if (moinhoObj && parqueObj) {
      await prisma.favorite.createMany({
        data: [
          { placeId: moinhoObj.id, collection: "Para visitar" },
          { placeId: parqueObj.id, collection: "Família", note: "Levar câmera" },
        ]
      })
    }
  } catch(e) {}
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
