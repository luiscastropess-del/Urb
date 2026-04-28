import { db } from './lib/prisma';
async function run() {
  try {
    const res = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'GuideProfile';`;
    console.log("GuideProfile columns:", res);
    
    console.log("Adding plan column to GuideProfile...");
    await db.$executeRawUnsafe(`ALTER TABLE "GuideProfile" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'free';`);
    await db.$executeRawUnsafe(`ALTER TABLE "GuideProfile" ADD COLUMN IF NOT EXISTS "packagesSold" INTEGER NOT NULL DEFAULT 0;`);
    
    // Check if GuideProfile has the column
    const cols = await db.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'GuideProfile';`;
    console.log("Columns after alter:", cols);
  } catch (e) {
    console.error(e);
  }
}
run();
