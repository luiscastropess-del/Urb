import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testFetch() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    console.log("Plans fetched successfully:", JSON.stringify(plans, null, 2));
  } catch (error) {
    console.error("Error fetching plans:", error);
  }
}

testFetch()
  .finally(async () => {
    await prisma.$disconnect();
  });
