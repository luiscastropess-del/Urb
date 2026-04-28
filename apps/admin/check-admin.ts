import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdmin() {
  const user = await prisma.user.findUnique({
    where: { email: "luiscastropess@gmail.com" }
  });
  if (user) {
    console.log(`User ${user.email} has role: ${user.role}`);
    if (user.role !== "admin") {
      console.log("Updating user to admin...");
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" }
      });
      console.log("User updated to admin.");
    }
  } else {
    console.log("User luiscastropess@gmail.com not found.");
  }
}

checkAdmin()
  .finally(async () => {
    await prisma.$disconnect();
  });
