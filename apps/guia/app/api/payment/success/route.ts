import { NextResponse } from "next/server";
import { db } from "@urb/shared";
import { API_BASE_URL } from "@/lib/constants";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const planId = searchParams.get("planId");
  const externalSubscriptionId = searchParams.get("subscriptionId");
  const status = searchParams.get("status") || "active";

  if (!email || !planId) {
    return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });
  }

  try {
    // Find the guide by email
    const user = await db.user.findUnique({
      where: { email },
      include: { guideProfile: true }
    });

    if (!user || !user.guideProfile) {
      return NextResponse.json({ error: "Guia não encontrado" }, { status: 404 });
    }

    // Update or create subscription
    await db.subscription.upsert({
      where: { guideId: user.guideProfile.id },
      update: {
        planId,
        status,
        externalSubscriptionId,
        paymentStatus: "paid",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        updatedAt: new Date(),
      },
      create: {
        guideId: user.guideProfile.id,
        planId,
        status,
        externalSubscriptionId,
        paymentStatus: "paid",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    });

    // Redireciona para a página de planos com parâmetro de sucesso
    const baseUrl = API_BASE_URL;
    return NextResponse.redirect(`${baseUrl}/dashboard/guia/perfil/planos?success=true`);
  } catch (error) {
    console.error("Erro ao processar sucesso de pagamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
