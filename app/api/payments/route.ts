"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      price,
      currency,
      hotelName,
      checkinDate,
      checkoutDate,
      photoUrl,
    } = body ?? {};

    if (
      !email ||
      typeof price !== "number" ||
      !currency ||
      !hotelName ||
      !checkinDate ||
      !checkoutDate
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields. Ensure email, price, currency, hotelName, checkinDate, and checkoutDate are provided.",
        },
        { status: 400 },
      );
    }

    const parsedCheckin = new Date(checkinDate);
    const parsedCheckout = new Date(checkoutDate);

    if (
      Number.isNaN(parsedCheckin.valueOf()) ||
      Number.isNaN(parsedCheckout.valueOf())
    ) {
      return NextResponse.json(
        { error: "Invalid check-in or check-out date." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found for the provided email." },
        { status: 404 },
      );
    }

    const payment = await (prisma as any).payment.create({
      data: {
        userId: user.id,
        price: price,
        currency,
        hotelName,
        checkinDate: parsedCheckin,
        checkoutDate: parsedCheckout,
        photoUrl,
      },
    });

    return NextResponse.json({ success: true, id: payment.id });
  } catch (error) {
    console.error("[api/payments] Failed to record payment", error);
    return NextResponse.json(
      { error: "Failed to record payment." },
      { status: 500 },
    );
  }
}
