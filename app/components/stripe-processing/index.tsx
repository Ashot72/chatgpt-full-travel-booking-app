"use client";

import React, { useState } from "react";
import { useOpenExternal } from "@/app/hooks/use-open-external";

type StripeProcessingProps = {
  price: number;
  currency: string;
  email: string;
  hotelName: string;
  checkinDate: string;
  checkoutDate: string;
  photoUrl: string;
};

export default function StripeProcessing({
  price,
  currency,
  email,
  hotelName,
  checkinDate,
  checkoutDate,
  photoUrl,
}: StripeProcessingProps) {
  const openExternal = useOpenExternal();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaymentDataReady = Boolean(
    hotelName &&
      checkinDate &&
      checkoutDate &&
      Number.isFinite(price) &&
      price > 0
  );

  async function handleCheckout() {
    if (checkoutUrl) {
      openExternal(checkoutUrl);
      return;
    }

    setIsLoading(true);
    setError(null);
    const quantity = 1;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: price * 100,
        quantity,
        currency,
        email,
        hotelName,
        checkinDate,
        checkoutDate,
        photoUrl,
      }),
    });

    try {
      if (!res.ok) {
        throw new Error(`Checkout failed with status ${res.status}`);
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error("Checkout session did not return a URL.");
      }

      setCheckoutUrl(url);
    } catch (err) {
      console.error("Failed to prepare checkout session", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to prepare checkout session."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <header className="text-center">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            <svg
              className="h-6 w-6 text-emerald-600"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 1a1 1 0 0 1 .447.105l8 4A1 1 0 0 1 21 6v6c0 5.768-3.57 10.254-8.79 11.787a1 1 0 0 1-.42 0C6.57 22.254 3 17.768 3 12V6a1 1 0 0 1 .553-.895l8-4A1 1 0 0 1 12 1zm0 2.118L5 6.382V12c0 4.876 3.112 8.954 7 9.877 3.888-.923 7-5.001 7-9.877V6.382l-7-3.264zM12 7a1 1 0 0 1 1 1v2h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2V8a1 1 0 0 1 1-1z" />
            </svg>
            <h2>Secure Payment Processing</h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Complete your booking with Stripe.
        </p>
      </header>

      {!isPaymentDataReady ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-green-500" />
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Loading payment details...
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              <svg
                className="h-5 w-5 text-emerald-600"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm17 2H4v2h16V7zm0 4H4v6h16v-6zm-4 3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h8z" />
              </svg>
              <span>Payment Summary</span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
              Total Amount
            </h3>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {currency} {price.toFixed(2)}
            </p>
          </div>

          <section className="rounded-xl border border-gray-100 bg-emerald-50/60 p-4 text-center dark:border-gray-800 dark:bg-emerald-900/20">
            <div className="flex flex-col items-center gap-2 text-sm text-emerald-900 dark:text-emerald-200">
              <div className="inline-flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2a1 1 0 0 1 .447.105l7 3.5A1 1 0 0 1 20 6v6c0 4.944-3.053 8.925-7.791 9.877a1 1 0 0 1-.418 0C6.053 20.925 3 16.944 3 12V6a1 1 0 0 1 .553-.895l7-3.5A1 1 0 0 1 12 2zm0 2.118L5 7.059V12c0 3.707 2.223 6.943 7 7.874 4.777-.931 7-4.167 7-7.874V7.059l-7-2.941zM12 7a1 1 0 0 1 1 1v2h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0v-2H9a1 1 0 0 1 0-2h2V8a1 1 0 0 1 1-1z" />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Secure Payment
                </span>
              </div>
              <p className="text-center">
                Your payment information is encrypted and processed securely by
                Stripe.
              </p>
              {email && (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Processing payment for{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              )}
            </div>
          </section>

          <div className="text-center">
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Preparing Checkout..."
                : checkoutUrl
                  ? "Open Stripe Checkout"
                  : "Pay Now"}
            </button>
            {checkoutUrl && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Checkout is ready. Click the button above to open Stripe in a
                new tab.
              </p>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <footer className="text-center text-xs text-gray-500 dark:text-gray-400">
            Powered by Stripe • SSL Encrypted
          </footer>
        </>
      )}
    </div>
  );
}
