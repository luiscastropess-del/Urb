"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "./actions.auth";

export async function getAllReservations() {
  const user = await getUserSession();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return await db.reservation.findMany({
    include: {
      customer: true,
      package: {
        include: {
          guide: {
             include: { user: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getReservationStats() {
    const user = await getUserSession();
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const total = await db.reservation.count();
    const confirmed = await db.reservation.count({ where: { status: "CONFIRMED" }});
    const completed = await db.reservation.count({ where: { status: "COMPLETED" }});
    
    const revenueAgg = await db.reservation.aggregate({
        where: {
            status: { in: ["CONFIRMED", "COMPLETED"]}
        },
        _sum: {
            totalPrice: true
        }
    });

    return {
        total,
        confirmed,
        completed,
        totalRevenue: revenueAgg._sum.totalPrice || 0
    }
}
