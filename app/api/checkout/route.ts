// app/api/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripeSecretKey = process.env.STRIPE_KEY;

if (!stripeSecretKey) {
  console.warn(
    "[api/checkout] STRIPE_KEY is not configured. Set it in your environment to enable Checkout.",
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2020-08-27",
    })
  : undefined;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Ensure STRIPE_SECRET_KEY is set on the server.",
      },
      { status: 500 },
    );
  }

  const {
    price,
    currency,
    quantity,
    email,
    hotelName,
    checkinDate,
    checkoutDate,
    photoUrl,
  } = await req.json();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    console.warn(
      "[api/checkout] NEXT_PUBLIC_BASE_URL is not configured. Redirect URLs will be invalid.",
    );
  }

  const parsedPrice = Number(price);
  const unitAmount = Math.round(parsedPrice);
  const parsedQuantity = Number(quantity ?? 1);

  if (!Number.isFinite(parsedPrice) || unitAmount <= 0) {
    return NextResponse.json(
      { error: "Invalid price supplied for checkout session." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return NextResponse.json(
      { error: "Quantity must be a positive integer." },
      { status: 400 },
    );
  }

  const baseParams = new URLSearchParams({
    amount: String(parsedPrice),
    currency,
    quantity: String(parsedQuantity),
    email: email ?? "",
    hotelName: hotelName ?? "",
    checkinDate: checkinDate ?? "",
    checkoutDate: checkoutDate ?? "",
    photoUrl: photoUrl ?? "",
    timestamp: new Date().toISOString(),
  });

  const successUrl = `${baseUrl}/success?${baseParams}`;
  const cancelUrl = `${baseUrl}/cancel?${baseParams}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency, // e.g. "usd"
            product_data: {
              name: "ChatGPT Booking",
            },
            unit_amount: unitAmount, // in the smallest currency unit (e.g. cents)
          },
          quantity: parsedQuantity,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[api/checkout] Failed to create session", error);

    return NextResponse.json(
      {
        error: "Unable to create checkout session. Please try again later.",
      },
      { status: 500 },
    );
  }
}
