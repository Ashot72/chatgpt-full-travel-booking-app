"use client";

import { useWidgetProps } from "../hooks";
import StripeProcessing from "../components/stripe-processing";
import type { Hotel } from "@/lib/types";

export default function StripeProcessingPage() {
  const widgetProps = useWidgetProps<{ hotel?: Hotel; email?: string }>();
  const hotelFromProps = widgetProps?.hotel;
  const hotelProperty = hotelFromProps?.property;
  const email = widgetProps?.email ?? "";

  return (
    <StripeProcessing
      price={hotelProperty?.priceBreakdown.grossPrice.value ?? 0}
      currency={hotelProperty?.priceBreakdown.grossPrice.currency ?? "USD"}
      hotelName={hotelProperty?.name ?? ""}
      checkinDate={hotelProperty?.checkinDate ?? ""}
      checkoutDate={hotelProperty?.checkoutDate ?? ""}
      photoUrl={hotelProperty?.photoUrls[0] ?? ""}
      email={email}
    />
  );
}
