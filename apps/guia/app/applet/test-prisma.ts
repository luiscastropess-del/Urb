import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const profile = await prisma.guideProfile.findFirst();
    console.log("GuideProfile customColors:", profile ? profile.customColors : "No profile found");
    console.log("SUCCESS");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
