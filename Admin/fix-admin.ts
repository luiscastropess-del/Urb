
import { db } from './lib/prisma';

async function main() {
  try {
    const adminEmail = "luiscastropess@gmail.com";
    
    const adminUser = await db.user.findUnique({
      where: { email: adminEmail }
    });

    if (adminUser) {
      await db.user.update({
        where: { email: adminEmail },
        data: { role: "admin" }
      });
      console.log(`User ${adminEmail} updated to ADMIN successfully.`);

      const existingGuide = await db.guideProfile.findUnique({
        where: { userId: adminUser.id }
      });

      if (existingGuide) {
        await db.guideProfile.update({
          where: { userId: adminUser.id },
          data: { status: "APPROVED" }
        });
        console.log(`Guide profile for ${adminEmail} updated to APPROVED.`);
      }
    } else {
      console.log(`User ${adminEmail} not found in database to update.`);
    }
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    process.exit(0);
  }
}

main();

