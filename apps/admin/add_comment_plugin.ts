import { db } from "./lib/prisma";

async function addPlugin() {
  try {
    await db.plugin.upsert({
      where: { slug: "comment-system" },
      update: { isActive: true },
      create: {
        name: "Sistema de Comentários",
        slug: "comment-system",
        description: "Sistema de comentários para os locais.",
        isActive: true,
        version: "1.0.0",
        author: "Admin"
      },
    });
    console.log("Plugin de comentários adicionado.");
  } catch (err) {
    console.error(err);
  }
}

addPlugin().then(() => process.exit(0));
