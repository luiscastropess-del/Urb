import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function debug() {
  try {
    console.log("Testing getFeaturedGuides fallback query...");
    const guides = await db.guideProfile.findMany({
      where: {
        AND: [
          { status: "APPROVED" },
          { plan: { in: ["pro", "ultimate"] } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    console.log("Success! Found:", guides.length);
  } catch (e: any) {
    console.error("Error in getFeaturedGuides query:", e.message || e);
    if (e.code) console.error("Error Code:", e.code);
  }

  try {
    console.log("Testing getGuide join query...");
    const guide = await db.guideProfile.findFirst({
        include: {
            user: true,
            packages: true
        }
    });
    console.log("Success! Guide found:", !!guide);
  } catch (e: any) {
    console.error("Error in getGuide query:", e.message || e);
    if (e.code) console.error("Error Code:", e.code);
  }

  await db.$disconnect();
}

debug();
