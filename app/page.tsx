"use client";

import { useState, useEffect } from "react";
import {
  useMaxHeight,
  useDisplayMode,
  useIsChatGptApp,
  useWidgetState,
  useCallTool,
} from "./hooks";
import TripDestination from "./components/trip-destination";
import { Destination, DestinationData } from "@/lib/types";

interface AppState {
  destination?: Destination;
  extracted_location?: string;
  search_query?: string;
  [key: string]: unknown;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [appState, setAppState] = useWidgetState<AppState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const isChatGptApp = useIsChatGptApp();
  const callTool = useCallTool();
  const searchQuery = appState?.search_query ?? "";

  // Handle search for destinations
  const handleSearch = async (queryOverride?: string) => {
    const query = (queryOverride ?? searchQuery).trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      // Call the Search Destination tool
      const result = await callTool?.("Search Destination", {
        user_message: query,
      });

      console.log("🔍 Search result:", result);

      const resultData = result as any;
      const structuredContent = resultData?.structuredContent;
      const destinationsData = structuredContent?.destinations as
        | DestinationData[]
        | undefined;

      if (destinationsData && destinationsData.length > 0) {
        const destinationPayload: Destination = {
          status: true,
          timestamp: Date.now(),
          data: destinationsData,
        };

        setAppState((prev) => ({
          ...prev,
          destination: destinationPayload,
          extracted_location: structuredContent?.extracted_location,
          search_query: query,
        }));
      } else {
        setAppState((prev) => ({
          ...prev,
          destination: undefined,
          extracted_location: undefined,
          search_query: query,
        }));
      }
    } catch (err) {
      setError("Failed to search destinations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const showWarning = mounted && !isChatGptApp;

  const destinationResult = appState?.destination ?? null;

  return (
    <div
      suppressHydrationWarning
      className="w-full flex flex-col"
      style={{
        maxHeight,
        height: mounted && displayMode === "fullscreen" ? maxHeight : undefined,
        minHeight:
          mounted && displayMode === "fullscreen" ? "100vh" : undefined,
        backgroundColor: "#ffffff",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Standalone Warning */}
        <div
          className="mb-6 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          style={{ display: showWarning ? "block" : "none" }}
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Running in standalone mode. This app is designed to run inside
            ChatGPT.
          </p>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            ✈️ Travel Booking
          </h1>
          <div className="flex flex-col items-center gap-2 mt-3">
            {/* Auth Status */}
            <div style={{ display: isChatGptApp ? "block" : "none" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ✅ Authenticated via Google OAuth
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Search for destinations to start booking!
              </p>
            </div>
          </div>
        </header>

        {/* Search Input */}
        <div className="mb-8 max-w-2xl mx-auto">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🌍 Where do you want to go?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setAppState((prev) => ({
                  ...prev,
                  search_query: e.target.value,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e.currentTarget.value);
                }
              }}
              placeholder="e.g., Egypt, Paris, Tokyo, Bali..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              disabled={loading}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchQuery.trim()}
              className="px-8 py-3 rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </span>
              ) : (
                "🔍 Search"
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto"></div>
            <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg">
              Searching destinations...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !destinationResult && (
          <div className="text-center max-w-2xl mx-auto pt-8 pb-12">
            <div className="flex flex-col items-center gap-4">
              <div className="text-7xl">🌍</div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Ready to explore the world?
              </h2>
              <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                Enter a destination above to discover amazing places to visit!
              </p>
            </div>
          </div>
        )}

        {/* Destination Results */}
        {!loading && destinationResult && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              📍 Found {destinationResult.data.length} destinations
            </h2>
            <TripDestination destination={destinationResult} />
          </div>
        )}
      </div>
    </div>
  );
}
