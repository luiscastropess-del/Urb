import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const pkgs = await db.tourPackage.findMany();
  console.log("Packages:", pkgs);
}
main().catch(console.error).finally(() => db.$disconnect());
