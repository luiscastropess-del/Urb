import { NextResponse } from "next/server";
import { db } from "@urb/shared";
import { getUserSession } from "@/app/actions.auth";

export async function GET(request: Request) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let reservations;

    if (user.role === "admin") {
      // Admin sees all reservations
      reservations = await db.reservation.findMany({
        include: {
          customer: {
            select: { name: true, email: true },
          },
          package: {
            select: { title: true, price: true, maxPeople: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "guide") {
      // Guide sees reservations for their packages
      const profile = await db.guideProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile) {
        return NextResponse.json({ error: "Perfil de guia não encontrado" }, { status: 404 });
      }

      reservations = await db.reservation.findMany({
        where: {
          package: {
            guideId: profile.id,
          },
        },
        include: {
          customer: {
            select: { name: true, email: true },
          },
          package: {
            select: { title: true, price: true, maxPeople: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Normal user sees their own reservations
      reservations = await db.reservation.findMany({
        where: { customerId: user.id },
        include: {
          package: {
            select: { title: true, price: true, maxPeople: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
