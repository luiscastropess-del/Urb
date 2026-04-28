import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const guideColumns: any[] = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'GuideProfile'
    `;
    console.log('Columns in GuideProfile:', guideColumns.map(c => c.column_name));
  } catch (e) {
    console.error('Error querying columns:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
