"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get("amount");
  const currencyParam = searchParams.get("currency") ?? "USD";
  const timestampParam = searchParams.get("timestamp");
  const emailParam = searchParams.get("email");
  const hotelNameParam = searchParams.get("hotelName");
  const checkinDateParam = searchParams.get("checkinDate");
  const checkoutDateParam = searchParams.get("checkoutDate");
  const photoUrlParam = searchParams.get("photoUrl");

  const [succeeded, setSucceeded] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedAmount = useMemo(() => {
    if (!amountParam) return null;
    const amountNumber = Number(amountParam);
    if (Number.isNaN(amountNumber)) return null;
    return (amountNumber / 100).toLocaleString(undefined, {
      style: "currency",
      currency: currencyParam?.toUpperCase(),
    });
  }, [amountParam, currencyParam]);

  useEffect(() => {
    if (succeeded) {
      return;
    }

    if (
      !amountParam ||
      !emailParam ||
      !hotelNameParam ||
      !checkinDateParam ||
      !checkoutDateParam
    ) {
      return;
    }

    const amountNumber = Number(amountParam);
    if (Number.isNaN(amountNumber)) {
      return;
    }

    const payload = {
      email: emailParam,
      price: amountNumber / 100,
      currency: currencyParam.toUpperCase(),
      hotelName: hotelNameParam,
      checkinDate: checkinDateParam,
      checkoutDate: checkoutDateParam,
      photoUrl: photoUrlParam,
    };

    async function payment() {
      try {
        setIsPersisting(true);
        setError(null);
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? `Failed with status ${res.status}`);
        }

        setSucceeded(true);
      } catch (error) {
        console.error("[success] Failed to persist payment", error);
        setError("Unable to record this payment in your history.");
      } finally {
        setIsPersisting(false);
      }
    }

    payment();
  }, [
    amountParam,
    currencyParam,
    emailParam,
    hotelNameParam,
    checkinDateParam,
    checkoutDateParam,
    photoUrlParam,
    succeeded,
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="rounded-3xl border border-emerald-200 bg-white/90 p-10 shadow-xl backdrop-blur dark:border-emerald-800/60 dark:bg-emerald-950/40">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-200">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm4.3 7.3-5 5a1 1 0 0 1-1.4 0l-2-2a1 1 0 0 1 1.4-1.4l1.3 1.29 4.3-4.3a1 1 0 0 1 1.4 1.42z" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
          Payment Successful
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
          Thank you for completing your booking. A confirmation email, including
          your receipt, will arrive shortly.
        </p>
        {formattedAmount && (
          <dl className="mt-6 grid gap-4 rounded-2xl bg-emerald-50/70 p-6 text-left text-emerald-900 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-100">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-medium">Amount Paid</dt>
              <dd className="text-lg font-semibold">{formattedAmount}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-medium">Currency</dt>
              <dd className="text-lg font-semibold">
                {currencyParam.toUpperCase()}
              </dd>
            </div>
            {emailParam && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium">Receipt Email</dt>
                <dd className="text-lg font-semibold break-all">
                  {emailParam}
                </dd>
              </div>
            )}
            {timestampParam && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium">Submission Date</dt>
                <dd className="text-lg font-semibold">
                  {new Date(timestampParam).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
            )}
          </dl>
        )}
        {(hotelNameParam ||
          checkinDateParam ||
          checkoutDateParam ||
          photoUrlParam) && (
          <div className="mt-8 space-y-4 rounded-2xl border border-emerald-200 bg-white/80 p-6 text-left shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Stay Details
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {photoUrlParam && (
                <img
                  src={photoUrlParam}
                  alt={hotelNameParam ?? "Hotel photo"}
                  className="h-32 w-full max-w-xs rounded-xl object-cover shadow-md"
                />
              )}
              <div className="flex-1 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {hotelNameParam && (
                  <p>
                    <span className="font-medium">Hotel:</span>{" "}
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {hotelNameParam}
                    </span>
                  </p>
                )}
                {(checkinDateParam || checkoutDateParam) && (
                  <p>
                    <span className="font-medium">Stay:</span>{" "}
                    {checkinDateParam && checkoutDateParam
                      ? `${checkinDateParam} → ${checkoutDateParam}`
                      : (checkinDateParam ?? checkoutDateParam)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {isPersisting && !error && !succeeded && (
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-teal-500"></div>
            <p>Saving to your booking history...</p>
          </div>
        )}
        {error && (
          <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {succeeded && !error && (
          <p className="mt-6 text-sm text-emerald-700 dark:text-emerald-300">
            Payment saved to your booking history. You can view booking payments
            any time by typing in ChatGPT: "Show payments for my bookings".
          </p>
        )}
      </div>
    </main>
  );
}
