import React from "react";
import { Destination, DestinationData } from "@/lib/types";

interface HotelSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDestinationData?: DestinationData;
  arrivalDate: string;
  setArrivalDate: (date: string) => void;
  departureDate: string;
  setDepartureDate: (date: string) => void;
  adults: number;
  handleAdultsChange: (delta: number) => void;
  children: number;
  handleChildrenChange: (delta: number) => void;
  childrenAges: number[];
  handleChildAgeChange: (index: number, age: string) => void;
  rooms: number;
  setRooms: (rooms: number) => void;
  handleSearchHotels: () => Promise<void>;
}

const HotelSearchPanel: React.FC<HotelSearchPanelProps> = ({
  isOpen,
  onClose,
  selectedDestinationData,
  arrivalDate,
  setArrivalDate,
  departureDate,
  setDepartureDate,
  adults,
  handleAdultsChange,
  children,
  handleChildrenChange,
  childrenAges,
  handleChildAgeChange,
  rooms,
  setRooms,
  handleSearchHotels,
}) => {
  if (!isOpen || !selectedDestinationData) {
    return null;
  }

  const fallbackLabel =
    selectedDestinationData?.label ??
    selectedDestinationData?.name ??
    "Selected destination";

  const controlButtonClasses =
    "flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-blue-300";

  const inputClasses =
    "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30";

  const roomsOptions = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <aside className="flex h-full w-full flex-col bg-white shadow-2xl dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex-1 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Search Hotels
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {selectedDestinationData.image_url ? (
          <div className="mb-3 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedDestinationData.image_url}
              alt={selectedDestinationData.name}
              className="h-40 min-h-[160px] w-full flex-shrink-0 object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-40 min-h-[160px] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-gray-400">
            No image available
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              {selectedDestinationData.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-left sm:text-center">
              {fallbackLabel}
            </p>
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Travel Dates
            </h3>
            <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium tracking-wide text-gray-500">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    className={`${inputClasses} sm:max-w-[160px] sm:mx-auto`}
                    value={arrivalDate}
                    onChange={(event) => setArrivalDate(event.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium tracking-wide text-gray-500">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    className={`${inputClasses} sm:max-w-[160px] sm:mx-auto`}
                    value={departureDate}
                    onChange={(event) => setDepartureDate(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Guests
            </h3>
            <div className="space-y-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Adults
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Age 17+
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={controlButtonClasses}
                      onClick={() => handleAdultsChange(-1)}
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {adults}
                    </span>
                    <button
                      type="button"
                      className={controlButtonClasses}
                      onClick={() => handleAdultsChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Children
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Age 0-17
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={controlButtonClasses}
                      onClick={() => handleChildrenChange(-1)}
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {children}
                    </span>
                    <button
                      type="button"
                      className={controlButtonClasses}
                      onClick={() => handleChildrenChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                {children > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Children ages
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {childrenAges.map((age, index) => (
                        <input
                          key={`child-age-${index}`}
                          type="number"
                          min={0}
                          max={17}
                          className={`${inputClasses} max-w-[100px] mx-auto`}
                          value={age}
                          onChange={(event) =>
                            handleChildAgeChange(index, event.target.value)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Rooms
            </h3>
            <select
              className={inputClasses}
              value={rooms}
              onChange={(event) => setRooms(Number(event.target.value) || 1)}
            >
              {roomsOptions.map((option) => (
                <option key={option} value={option}>
                  {option} Room{option > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </section>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 pb-6 pt-4 dark:border-gray-800">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          onClick={handleSearchHotels}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.65" y2="16.65" />
          </svg>
          Search Hotels
        </button>
      </div>
    </aside>
  );
};

export default HotelSearchPanel;
