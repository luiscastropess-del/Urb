import { db } from './lib/prisma';
async function test() {
  try {
    const guide = await db.guideProfile.findFirst();
    console.log(guide ? "Got guide: " + guide.plan : "No guide");
  } catch(e) {
    console.error(e);
  }
}
test();
