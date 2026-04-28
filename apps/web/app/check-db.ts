import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'GuideProfile'
    `;
    console.log('Columns in GuideProfile:', columns);
  } catch (e) {
    console.error('Error querying columns:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
