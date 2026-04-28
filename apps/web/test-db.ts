import { db } from './lib/prisma';
async function test() {
  try {
    const res = await db.$queryRaw`SELECT current_database();`;
    console.log("Current DB:", res);
    
    // Check if GuideProfile has the column
    const cols = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'GuideProfile';`;
    console.log("Columns:", cols);
  } catch (e) {
    console.error(e);
  }
}
test();
