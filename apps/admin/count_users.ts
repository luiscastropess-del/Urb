import { db } from "./lib/prisma";

async function countUsers() {
  const count = await db.user.count();
  const users = await db.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  console.log(`Total users: ${count}`);
  console.log("Users:", JSON.stringify(users, null, 2));
}

countUsers().then(() => process.exit(0));
