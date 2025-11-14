"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useDisplayMode,
  useIsChatGptApp,
  useMaxHeight,
  useWidgetProps,
} from "../hooks";

type PaymentSummary = {
  id: string;
  price: number;
  currency: string;
  hotelName: string;
  checkinDate: string;
  checkoutDate: string;
  photoUrl?: string | null;
  createdAt?: string;
};

interface PaymentsWidgetProps extends Record<string, unknown> {
  payments?: PaymentSummary[];
  email?: string;
  count?: number;
  timestamp?: string;
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number, currency: string) {
  if (Number.isNaN(amount)) {
    return "—";
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function PaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const widgetProps = useWidgetProps<PaymentsWidgetProps>(
    {} as PaymentsWidgetProps
  );
  const paymentsFromProps = widgetProps?.payments;
  const email = widgetProps?.email ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const paymentsToShow = useMemo(() => {
    if (!Array.isArray(paymentsFromProps)) {
      return null;
    }
    return paymentsFromProps.slice().sort((a, b) => {
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bCreated - aCreated;
    });
  }, [paymentsFromProps]);

  const showWarning = mounted && !isChatGptApp;
  const showLoader = paymentsFromProps === undefined;

  return (
    <div
      suppressHydrationWarning
      className="flex w-full flex-col"
      style={{
        maxHeight,
        height: mounted && displayMode === "fullscreen" ? maxHeight : undefined,
        minHeight:
          mounted && displayMode === "fullscreen" ? "100vh" : undefined,
        backgroundColor: "#ffffff",
      }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8">
        <div
          className="mb-6 rounded-lg border border-yellow-200 bg-yellow-100 p-3 dark:border-yellow-800 dark:bg-yellow-900/30"
          style={{ display: showWarning ? "block" : "none" }}
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Running in standalone mode. This app is designed to run inside
            ChatGPT.
          </p>
        </div>

        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-semibold text-gray-800 dark:text-gray-100">
            💳 Booking Payments
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Review the bookings you have paid for using the booking assistant.
          </p>
          {email ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Signed in as <span className="font-medium">{email}</span>
            </p>
          ) : null}
        </header>

        {showLoader ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-green-500" />
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              Loading payments...
            </p>
          </div>
        ) : !paymentsToShow || paymentsToShow.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
            <div className="text-6xl">🧾</div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">
              No payments found
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Once you complete a booking payment, the receipt will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paymentsToShow.map((payment) => (
              <article
                key={payment.id}
                className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 md:flex-row md:items-stretch"
              >
                {payment.photoUrl ? (
                  <div className="overflow-hidden rounded-xl bg-gray-100 md:h-auto md:w-56 md:flex-shrink-0">
                    <img
                      src={payment.photoUrl}
                      alt={`${payment.hotelName} photo`}
                      className="h-48 w-full object-cover md:h-full"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[12rem] items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-gray-500 md:w-56 md:flex-shrink-0">
                    No photo available
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {payment.hotelName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Stay from {formatDate(payment.checkinDate)} to{" "}
                      {formatDate(payment.checkoutDate)}
                    </p>
                      <div className="inline-flex items-baseline gap-2 text-base">
                        <span className="font-semibold text-gray-600 dark:text-gray-200">
                          Total Paid
                        </span>
                        <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(payment.price, payment.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                      ✅ Payment Confirmed
                    </span>
                    {payment.createdAt ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                          Paid On:
                        </span>
                        <span>{formatDate(payment.createdAt)}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                          Paid On:
                        </span>
                        <span>—</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
