"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "./actions.auth";

export async function createReservation({
  packageId,
  date,
  guests,
  notes,
}: {
  packageId: string;
  date: string;
  guests: number;
  notes?: string;
}) {
  const user = await getUserSession();
  if (!user) throw new Error("Unauthorized");

  const pkg = await db.tourPackage.findUnique({
    where: { id: packageId },
  });

  if (!pkg) throw new Error("Package not found");

  const totalPrice = pkg.price * guests;

  const reservation = await db.reservation.create({
    data: {
      customerId: user.id,
      packageId,
      date: new Date(date),
      guests,
      notes,
      totalPrice,
      status: "PENDING",
    },
  });

  return reservation;
}

export async function getCustomerReservations() {
  const user = await getUserSession();
  if (!user) throw new Error("Unauthorized");

  return await db.reservation.findMany({
    where: { customerId: user.id },
    include: {
      package: {
        include: {
          guide: {
            include: { user: true }
          }
        }
      },
      review: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getGuideReservations() {
    const user = await getUserSession();
    if (!user || user.role !== "guide" && user.role !== "admin") throw new Error("Unauthorized");

    const profile = await db.guideProfile.findUnique({
        where: { userId: user.id }
    });

    if (!profile) return [];

    return await db.reservation.findMany({
        where: {
            package: {
                guideId: profile.id
            }
        },
        include: {
            customer: true,
            package: true,
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function cancelReservation(id: string) {
  const user = await getUserSession();
  if (!user) throw new Error("Unauthorized");

  const reservation = await db.reservation.findUnique({
    where: { id }
  });

  if (!reservation || reservation.customerId !== user.id) {
    throw new Error("Reservation not found or unauthorized");
  }

  if (reservation.status !== "PENDING" && reservation.status !== "CONFIRMED") {
    throw new Error("Cannot cancel reservation in this status");
  }

  return await db.reservation.update({
    where: { id },
    data: { status: "CANCELLED" }
  });
}

export async function updateReservationStatus(id: string, status: string) {
    const user = await getUserSession();
    if (!user || user.role !== "guide" && user.role !== "admin") throw new Error("Unauthorized");

    // In a real app, verify if the guide owns this reservation package
    return await db.reservation.update({
        where: { id },
        data: { status }
    });
}
