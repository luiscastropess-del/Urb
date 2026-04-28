const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function main() {
  try {
    const res = await db.guideProfile.findMany({
      where: {
        AND: [
          { status: "APPROVED" },
          { plan: { in: ["pro", "ultimate"] } }
        ]
      }
    });
    console.log("Found:", res.length);
  } catch (e) {
    console.error(e);
  }
}
main();
