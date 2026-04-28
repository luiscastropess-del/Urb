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

  const apiUrl = "https://local-urbano.onrender.com";

  const res = await fetch(`${apiUrl}/api/public/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId,
      date: new Date(date).toISOString(),
      guests,
      notes,
      customerName: user.name,
      customerEmail: user.email
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create reservation");
  }

  return await res.json();
}

export async function getCustomerReservations() {
  const user = await getUserSession();
  if (!user) throw new Error("Unauthorized");

  const apiUrl = "https://local-urbano.onrender.com";
  try {
     const res = await fetch(`${apiUrl}/api/public/reservations?email=${encodeURIComponent(user.email)}`, { 
       cache: "no-store",
       headers: {
         "Content-Type": "application/json"
       }
     });
     
     if (res.ok) {
       const data = await res.json();
       console.log("Reservations fetched successfully:", data.length);
       return data;
     } else {
       const errorText = await res.text();
       console.error("API Error fetching reservations:", res.status, errorText);
     }
  } catch(e) {
     console.error("Network error fetching reservations:", e);
  }

  try {
    const localReservations = await db.reservation.findMany({
      where: { customerId: user.id },
      include: {
        package: {
          include: {
            guide: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return localReservations.map(r => ({
      id: r.id,
      packageId: r.packageId,
      date: r.date.toISOString(),
      status: r.status,
      totalPrice: r.totalPrice,
      guests: r.guests,
      package: r.package ? {
        id: r.package.id,
        title: r.package.title,
        coverImage: r.package.images && r.package.images.length > 0 ? r.package.images[0] : null,
        city: "Holambra",
        duration: r.package.durationDays,
        guide: r.package.guide ? {
          id: r.package.guide.id,
          name: r.package.guide.user.name,
          avatar: r.package.guide.user.avatar,
        } : null
      } : null
    }));
  } catch (dbErr) {
    console.error("Local DB fetch failed:", dbErr);
  }

  return [];
}


export async function cancelReservation(id: string) {
  const user = await getUserSession();
  if (!user) throw new Error("Unauthorized");

  // Local fallback
  try {
    const localRes = await db.reservation.findUnique({ where: { id } });
    if (localRes && localRes.customerId === user.id) {
      await db.reservation.update({
        where: { id },
        data: { status: "CANCELLED" }
      });
      return { success: true };
    }
  } catch (err) {}
  
  throw new Error("Cannot cancel remote reservations from client via local DB.");
}

