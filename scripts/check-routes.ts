import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const routes = await prisma.apiRoute.findMany();
  console.log(routes);
}
main().finally(() => prisma.$disconnect());
