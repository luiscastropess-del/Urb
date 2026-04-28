import { NextResponse } from "next/server";
import { db } from "@urb/shared";
import { getUserSession } from "@/app/actions.auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== "guide" && user.role !== "admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "O status é obrigatório" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // Verificar se a reserva existe e se o guia a possui (se for guide)
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        package: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
    }

    if (user.role === "guide") {
      const profile = await db.guideProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile || profile.id !== reservation.package.guideId) {
        return NextResponse.json({ error: "Você não tem permissão para alterar esta reserva" }, { status: 403 });
      }
    }

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, reservation: updatedReservation });
  } catch (error) {
    console.error("Erro ao atualizar o status da reserva:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
