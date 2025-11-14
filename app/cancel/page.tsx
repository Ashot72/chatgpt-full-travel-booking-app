"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get("amount");
  const currencyParam = searchParams.get("currency") || "USD";
  const timestampParam = searchParams.get("timestamp") || undefined;
  const emailParam = searchParams.get("email") || undefined;
  const hotelNameParam = searchParams.get("hotelName") || undefined;
  const checkinDateParam = searchParams.get("checkinDate") || undefined;
  const checkoutDateParam = searchParams.get("checkoutDate") || undefined;
  const photoUrlParam = searchParams.get("photoUrl") || undefined;

  const formattedAmount = useMemo(() => {
    if (!amountParam) return null;
    const amountNumber = Number(amountParam);
    if (Number.isNaN(amountNumber)) return null;
    return (amountNumber / 100).toLocaleString(undefined, {
      style: "currency",
      currency: currencyParam.toUpperCase(),
    });
  }, [amountParam, currencyParam]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="rounded-3xl border border-orange-200 bg-white/90 p-10 shadow-xl backdrop-blur dark:border-orange-700/60 dark:bg-orange-950/30">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm3.54 13.46a1 1 0 0 1-1.41 0L12 13.33l-2.12 2.13a1 1 0 0 1-1.41-1.42L10.59 12l-2.12-2.12a1 1 0 0 1 1.41-1.42L12 10.59l2.12-2.13a1 1 0 0 1 1.41 1.42L13.41 12l2.13 2.12a1 1 0 0 1 0 1.41z" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
          Payment Cancelled
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
          Your transaction was cancelled. If you meant to complete the booking,
          you can try again or reach out for assistance.
        </p>
        {formattedAmount && (
          <dl className="mt-6 grid gap-4 rounded-2xl bg-orange-50/70 p-6 text-left text-orange-900 shadow-sm dark:bg-orange-900/40 dark:text-orange-100">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-medium">Pending Amount</dt>
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
                <dt className="text-sm font-medium">Account Email</dt>
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
          <div className="mt-8 space-y-4 rounded-2xl border border-orange-200 bg-white/80 p-6 text-left shadow-sm dark:border-orange-700/50 dark:bg-orange-950/30">
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
                    <span className="font-semibold text-orange-700 dark:text-orange-300">
                      {hotelNameParam}
                    </span>
                  </p>
                )}
                {(checkinDateParam || checkoutDateParam) && (
                  <p>
                    <span className="font-medium">Original stay:</span>{" "}
                    {checkinDateParam && checkoutDateParam
                      ? `${checkinDateParam} → ${checkoutDateParam}`
                      : (checkinDateParam ?? checkoutDateParam)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
