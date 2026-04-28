import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testFullGuides() {
  try {
    console.log("Testing full guides fetch with counts...");
    const guides = await prisma.guideProfile.findMany({
      include: {
        user: true,
        _count: {
          select: { routes: true, packages: true }
        }
      },
    });
    console.log("Found guides:", guides.length);
    if (guides.length > 0) {
      console.log("First guide details:", JSON.stringify(guides[0], null, 2));
    }
  } catch (error: any) {
    console.error("CRITICAL ERROR FETCHING GUIDES:", error.message);
    if (error.code) console.error("Prisma Code:", error.code);
  }
}

testFullGuides()
  .finally(async () => {
    await prisma.$disconnect();
  });
