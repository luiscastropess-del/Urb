import { NextResponse } from "next/server";
import { db } from "@urb/shared";
import { getUserSession } from "@/app/actions.auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Verificar se a reserva existe
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        package: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
    }

    // Validação de permissão
    if (user.role === "guide") {
      const profile = await db.guideProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile || profile.id !== reservation.package.guideId) {
        return NextResponse.json({ error: "Você não tem permissão para alterar esta reserva" }, { status: 403 });
      }
    } else if (user.role === "user") {
      if (reservation.customerId !== user.id) {
        return NextResponse.json({ error: "Você não tem permissão para alterar esta reserva" }, { status: 403 });
      }
      
      // Usuários normais só podem atualizar certas coisas, como cancelar
      if (body.status && body.status !== "CANCELLED") {
        return NextResponse.json({ error: "Usuários só podem cancelar reservas" }, { status: 403 });
      }
    }

    // Filtrar os campos permitidos para atualização (ex: date, tickets, status)
    const allowedUpdates: any = {};
    if (body.date) allowedUpdates.date = new Date(body.date);
    if (body.tickets !== undefined) allowedUpdates.tickets = parseInt(body.tickets);
    if (body.status) allowedUpdates.status = body.status;
    if (body.totalPrice !== undefined) allowedUpdates.totalPrice = parseFloat(body.totalPrice);

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para atualização fornecido" }, { status: 400 });
    }

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: allowedUpdates,
    });

    return NextResponse.json({ success: true, reservation: updatedReservation });
  } catch (error) {
    console.error("Erro ao atualizar a reserva:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        package: true,
        customer: {
          select: { name: true, email: true }
        }
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
        return NextResponse.json({ error: "Você não tem permissão para ver esta reserva" }, { status: 403 });
      }
    } else if (user.role === "user") {
      if (reservation.customerId !== user.id) {
        return NextResponse.json({ error: "Você não tem permissão para ver esta reserva" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error("Erro ao buscar a reserva:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
