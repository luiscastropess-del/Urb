import { NextResponse } from "next/server";
import { getUserSession } from "@/app/actions.auth";
import { db } from "@/lib/prisma";

const ALLOWED_ORIGIN = "*";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "http://localhost:3000";
    
    // Add CORS headers for the response
    const corsHeaders = {
      "Access-Control-Allow-Origin": req.headers.get("origin") === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "*",
    };

    const body = await req.json();
    const { planId, isExternal, redirectUrl, userId: externalUserId } = body;

    let userId: string | undefined;

    if (isExternal && externalUserId) {
      userId = externalUserId;
    } else {
      const session = await getUserSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
      }
      userId = session.id;
      // We also update session.role... wait, session only updates role in db.
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400, headers: corsHeaders });
    }

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400, headers: corsHeaders });
    }

    const plan = await db.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400, headers: corsHeaders });
    }

    // Checkout Logic (PagDev mock or similar integration sem gateway externo)
    let guideProfile = await db.guideProfile.findUnique({
      where: { userId: userId },
    });

    if (!guideProfile) {
      guideProfile = await db.guideProfile.create({
        data: {
          userId: userId,
          status: "APPROVED",
        }
      });
    }

    const activeUntil = new Date();
    activeUntil.setMonth(activeUntil.getMonth() + (plan.interval === 'annual' || plan.interval === 'yearly' ? 12 : 1));

    await db.subscription.upsert({
      where: { guideId: guideProfile.id },
      create: {
        guideId: guideProfile.id,
        planId: plan.id,
        externalSubscriptionId: "pagdev_" + Date.now(),
        status: "active",
        paymentStatus: "paid",
        currentPeriodEnd: activeUntil,
      },
      update: {
        planId: plan.id,
        externalSubscriptionId: "pagdev_" + Date.now(),
        status: "active",
        paymentStatus: "paid",
        currentPeriodEnd: activeUntil,
      }
    });

    // Update user role and plan info
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (user) {
      await db.user.update({
        where: { id: userId },
        data: { 
          role: user.role === "admin" ? "admin" : "guide",
          plan: plan.name,
          paymentStatus: "PAID"
        }
      });
    }

    let successUrl = `${origin}/admin/assinaturas?success=true&pagdev=true`;
    
    if (redirectUrl) {
      successUrl = redirectUrl;
    } else if (isExternal) {
      successUrl = `${origin}/subscribe/success?plan=${plan.name}`;
    }

    return NextResponse.json({ 
      success: true, 
      url: successUrl,
      role: user?.role === "admin" ? "admin" : "guide"
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}
