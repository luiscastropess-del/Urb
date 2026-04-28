import { db } from "./lib/prisma";

async function testLibPrisma() {
  try {
    const plans = await db.plan.findMany();
    console.log("Plano count:", plans.length);
    const guides = await db.guideProfile.findMany({ include: { user: true } });
    console.log("Guia count:", guides.length);
  } catch (err: any) {
    console.error("Lib Prisma Test failed:", err.message);
  } finally {
    process.exit(0);
  }
}

testLibPrisma();
