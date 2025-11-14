"use client";

import { useEffect, useState } from "react";
import {
  useCallTool,
  useDisplayMode,
  useIsChatGptApp,
  useMaxHeight,
  useWidgetProps,
} from "../hooks";
import HotelsByDestination from "../components/hotels_by_destination";
import type { Hotel, HotelSearchParams } from "@/lib/types";

export default function HotelsPage() {
  const [mounted, setMounted] = useState(false);
  const widgetProps = useWidgetProps<{ searchParams?: HotelSearchParams }>({
    searchParams: undefined,
  });
  const searchParamsFromProps = widgetProps?.searchParams;
  const [hotels, setHotels] = useState<Hotel[] | null>(null);
  const [email, setEmail] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(searchParamsFromProps));

  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const callTool = useCallTool();

  const showWarning = mounted && !isChatGptApp;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!searchParamsFromProps || !callTool) {
      return;
    }

    (async () => {
      try {
        const payload: Record<string, unknown> = { ...searchParamsFromProps };
        const result = await callTool("Get Hotels By Destination", payload);
        if (!result) {
          setLoading(false);
          return;
        }

        const structured = (result as any)?.structuredContent ?? {};
        const hotelsList = Array.isArray(structured?.hotels)
          ? (structured.hotels as Hotel[])
          : undefined;

        if (hotelsList && hotelsList.length > 0) {
          setHotels(hotelsList);
        } else {
          setHotels(null);
          setError("No hotels returned for the selected destination.");
        }

        setEmail(structured?.email);
      } catch (err) {
        setError("Failed to fetch hotels for the selected destination.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [callTool, searchParamsFromProps]);

  return (
    <div
      suppressHydrationWarning
      className="flex flex-col w-full"
      style={{
        maxHeight,
        height: mounted && displayMode === "fullscreen" ? maxHeight : undefined,
        minHeight:
          mounted && displayMode === "fullscreen" ? "100vh" : undefined,
        backgroundColor: "#ffffff",
      }}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
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
            🏨 Hotels Explorer
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            View hotel listings for your selected destination.
          </p>
        </header>

        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
            <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-teal-500" />
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              Loading hotels...
            </p>
          </div>
        ) : !hotels || hotels.length === 0 ? (
          <div className="mx-auto max-w-2xl pt-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-7xl">🛏️</div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                No hotels loaded
              </h2>
              <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                Run a destination search first, then use the hotels view to
                explore places to stay.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
              🏨 Showing {hotels.length} hotels
            </h2>
            <HotelsByDestination hotels={hotels} email={email} />
          </div>
        )}
      </div>
    </div>
  );
}
