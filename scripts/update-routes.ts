import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting API Routes URLs update for new domains...');

  const routes = await prisma.apiRoute.findMany();

  let updatedCount = 0;

  for (const route of routes) {
    let newUrl = route.url;

    if (newUrl.includes('pguia.onrender.com')) {
      newUrl = newUrl.replace('pguia.onrender.com', 'local-urbano.onrender.com');
    }
    
    if (newUrl.includes('adminguide.onrender.com')) {
      newUrl = newUrl.replace('adminguide.onrender.com', 'adm-urbano.onrender.com');
    }

    if (newUrl !== route.url) {
      await prisma.apiRoute.update({
        where: { id: route.id },
        data: { url: newUrl }
      });
      console.log(`Updated route ${route.name}:`);
      console.log(`  From: ${route.url}`);
      console.log(`  To:   ${newUrl}`);
      updatedCount++;
    }
  }

  console.log(`\nUpdate complete. Modified ${updatedCount} API routes.`);
}

main()
  .catch(e => {
    console.error('Error updating URLs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
