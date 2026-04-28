import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const user = await db.user.create({
    data: {
      email: 'guia@example.com',
      name: 'João Guia Local',
      role: 'USER',
    }
  });

  const guide = await db.guideProfile.create({
    data: {
      userId: user.id,
      bio: 'Guia experiente em Holambra.',
      status: 'APPROVED',
      plan: 'pro'
    }
  });

  await db.tourPackage.create({
    data: {
      guideId: guide.id,
      title: 'Passeio pelos Campos Mágicos',
      description: 'Descubra as flores mágicas de Holambra.',
      price: 150.00,
      durationDays: 1,
      maxPeople: 5,
      status: 'PUBLISHED',
      images: ['https://picsum.photos/800/600?random=1']
    }
  });

  await db.tourPackage.create({
    data: {
      guideId: guide.id,
      title: 'Tour Gastronômico Holandês',
      description: 'Delícias típicas nas ruas de Holambra.',
      price: 120.00,
      durationDays: 1,
      maxPeople: 10,
      status: 'PUBLISHED',
      images: ['https://picsum.photos/800/600?random=2']
    }
  });

  console.log('Seeded database with fallback packages.');
}

main().catch(e => console.error(e)).finally(() => db.$disconnect());
