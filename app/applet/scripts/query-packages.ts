import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const pkgs = await db.tourPackage.findMany({ include: { guide: { include: { user: true } } } });
  console.log("Packages:", JSON.stringify(pkgs, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
