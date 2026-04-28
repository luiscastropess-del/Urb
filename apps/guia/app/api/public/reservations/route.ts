import { NextResponse } from "next/server";
import { db } from "@urb/shared";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { packageId, date, guests, notes, customerName, customerEmail } = data;

    if (!packageId || !date || !customerName || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // Since the client app might not send a valid customer ID (or they share DB but users are complicated),
    // let's ensure the user exists or create a stub user.
    let user = await db.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          password: "password_reserved_via_api" // Stub password since they auth on client app
        }
      });
    }

    const pkg = await db.tourPackage.findUnique({ where: { id: packageId }});
    
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const reservation = await db.reservation.create({
      data: {
        packageId,
        customerId: user.id,
        date: new Date(date),
        guests: guests || 1,
        totalPrice: pkg.price * (guests || 1),
        notes: notes || null,
        status: "PENDING"
      }
    });

    return NextResponse.json(reservation, { 
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      }
    });
  } catch (error) {
    console.error("Error creating reservation via API:", error);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
