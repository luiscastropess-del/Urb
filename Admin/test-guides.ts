import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testGuides() {
  try {
    const guides = await prisma.guideProfile.findMany({
      include: {
        user: true,
      },
    });
    console.log("Guide profiles found:", guides.length);
    if (guides.length > 0) {
      console.log("First guide status:", guides[0].status);
    }
  } catch (error) {
    console.error("Error fetching guides:", error);
  }
}

testGuides()
  .finally(async () => {
    await prisma.$disconnect();
  });
