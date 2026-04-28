import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function auditGuides() {
  try {
    const guides = await prisma.guideProfile.findMany({
      include: { user: true }
    });
    
    console.log(`Auditing ${guides.length} guides:`);
    guides.forEach((g, i) => {
      console.log(`Guide ${i + 1}: ID=${g.id}, Name=${g.user?.name || "MISSING USER"}, Email=${g.user?.email || "N/A"}`);
    });
    
    const plans = await prisma.plan.findMany();
    console.log(`Auditing ${plans.length} plans:`);
    plans.forEach((p, i) => {
      console.log(`Plan ${i + 1}: Name=${p.name}, Price=${p.price}, Active=${p.isActive}`);
    });
    
  } catch (err: any) {
    console.error("Audit failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

auditGuides();
