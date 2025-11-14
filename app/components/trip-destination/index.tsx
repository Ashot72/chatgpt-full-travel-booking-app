import React, { useEffect, useRef, useState } from "react";
import { Destination, DestinationData, HotelSearchParams } from "@/lib/types";
import ValidationDialog from "../shared/validationDialog";
import HotelSearchPanel from "./hotelSearchPanel";
import { useRequestDisplayMode, useSendMessage } from "@/app/hooks";
import { useOpenAIGlobal } from "@/app/hooks/use-openai-global";

type TripDestinationProps = {
  destination: Destination;
};

const TripDestination: React.FC<TripDestinationProps> = ({ destination }) => {
  const [selectedDestinationData, setSelectedDestinationData] =
    useState<DestinationData>();
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [rooms, setRooms] = useState(1);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [dateError, setDateError] = useState<string>("");
  const [showPanel, setShowPanel] = useState(false);
  const sendMessage = useSendMessage();

  const displayMode = useOpenAIGlobal("displayMode");
  const requestDisplayMode = useRequestDisplayMode();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset component state when destination prop changes
  useEffect(() => {
    if (destination && destination.data && destination.data.length > 0) {
      setSelectedDestinationData(destination.data[0]);
      resetFormState();
      setShowPanel(false);
    }
  }, [destination]);

  const resetFormState = () => {
    setArrivalDate("");
    setDepartureDate("");
    setAdults(1);
    setChildren(0);
    setChildrenAges([]);
    setRooms(1);
    setShowDateDialog(false);
    setDateError("");
  };

  const handleCardClick = async (destinationData: DestinationData) => {
    setSelectedDestinationData(destinationData);
    resetFormState();
    const result = await requestDisplayMode("fullscreen");
    if (result?.mode !== "fullscreen") {
      setShowPanel(false);
    }
  };

  const handleClosePanel = async () => {
    await requestDisplayMode("inline");
    setShowPanel(false);
  };

  useEffect(() => {
    if (displayMode === "fullscreen" && selectedDestinationData) {
      setShowPanel(true);
    }

    if (displayMode && displayMode !== "fullscreen") {
      setShowPanel(false);
    }
  }, [displayMode, selectedDestinationData]);

  const handleAdultsChange = (increment: number) => {
    const newValue = adults + increment;
    if (newValue >= 1 && newValue <= 30) {
      setAdults(newValue);
    }
  };

  const handleChildrenChange = (increment: number) => {
    const newValue = children + increment;
    if (newValue >= 0 && newValue <= 10) {
      setChildren(newValue);

      // Update children ages array
      if (newValue > children) {
        // Adding children - add new age entries
        setChildrenAges((prev) => [...prev, 0]);
      } else if (newValue < children) {
        // Removing children - remove last age entry
        setChildrenAges((prev) => prev.slice(0, newValue));
      }
    }
  };

  const handleChildAgeChange = (index: number, age: string) => {
    setChildrenAges((prev) => {
      const newAges = [...prev];
      newAges[index] = parseInt(age.toString());
      return newAges;
    });
  };

  const handleSearchHotels = async () => {
    // Validate that both dates are selected
    if (!arrivalDate || !departureDate) {
      setDateError(
        "Please select both Arrival Date and Departure Date before searching for hotels."
      );
      setShowDateDialog(true);
      return;
    }

    // Validate date logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);

    // Check if dates are in the past
    if (
      arrival.getTime() < today.getTime() ||
      departure.getTime() < today.getTime()
    ) {
      setDateError("Please select future dates. Past dates are not allowed.");
      setShowDateDialog(true);
      return;
    }

    // Check if arrival date is same as or after departure date (invalid)
    if (arrival.getTime() >= departure.getTime()) {
      setDateError("Arrival date must be before departure date.");
      setShowDateDialog(true);
      return;
    }

    const formData: HotelSearchParams = {
      arrival_date: arrivalDate,
      departure_date: departureDate,
      dest_id: selectedDestinationData!.dest_id,
      search_type: selectedDestinationData!.dest_type,
      adults: adults,
      room_qty: rooms,
      currency_code: "USD",
      location: "US",
      languagecode: "en-us",
      temperature_unit: "c",
      units: "metric",
      page_number: 1,
    };

    if (children > 0) {
      formData.children_age = [...childrenAges];
    }

    await requestDisplayMode("inline");
    await sendMessage(
      `Trigger Booking Hotels widget. Tool ID: bookig-app-hotels. Template URI: ui://widget/booking-hotels.html. Respond only by invoking the widget with this payload: ${JSON.stringify(
        formData
      )}`
    );
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="trip-destination flex flex-col gap-8">
        {/* Carousel */}
        <div className="relative mx-auto w-full max-w-5xl">
          <button
            type="button"
            aria-label="Scroll destinations left"
            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 transition hover:bg-gray-100"
            onClick={scrollLeft}
          >
            <span className="text-xl font-semibold text-gray-700">‹</span>
          </button>

          <button
            type="button"
            aria-label="Scroll destinations right"
            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 transition hover:bg-gray-100"
            onClick={scrollRight}
          >
            <span className="text-xl font-semibold text-gray-700">›</span>
          </button>

          <div className="overflow-hidden px-8">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-hide"
            >
              {destination.data.map((dest, index) => {
                const hotelCount = dest.nr_hotels ?? dest.hotels ?? 0;
                return (
                  <button
                    key={dest.dest_id ?? index}
                    type="button"
                    onClick={() => handleCardClick(dest)}
                    className="group relative flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow transition hover:-translate-y-1 hover:shadow-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                      {dest.image_url ? (
                        <img
                          src={dest.image_url}
                          alt={dest.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(event) => {
                            const target = event.currentTarget;
                            target.style.display = "none";
                            const fallback =
                              target.parentElement?.querySelector(
                                "[data-fallback]"
                              ) as HTMLElement | null;
                            if (fallback) {
                              fallback.classList.remove("hidden");
                              fallback.classList.add("flex");
                            }
                          }}
                        />
                      ) : null}
                      <div
                        data-fallback
                        className={`absolute inset-0 ${dest.image_url ? "hidden" : "flex"} items-center justify-center bg-gray-100 text-sm text-gray-500`}
                      >
                        No Image
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 p-4">
                      <p
                        className="text-base font-semibold text-gray-800"
                        title={`Destination: ${dest.name}`}
                      >
                        {dest.name}
                      </p>
                      <p
                        className="text-xs text-gray-500"
                        title={`Location: ${dest.label}`}
                      >
                        {dest.label}
                      </p>
                      <p
                        className="text-xs font-medium text-teal-600"
                        title={`Available: ${hotelCount} hotels`}
                      >
                        {hotelCount} hotels
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[399px] overflow-y-auto bg-white shadow-2xl dark:bg-gray-900">
            <HotelSearchPanel
              isOpen={Boolean(selectedDestinationData)}
              onClose={handleClosePanel}
              selectedDestinationData={selectedDestinationData}
              arrivalDate={arrivalDate}
              setArrivalDate={setArrivalDate}
              departureDate={departureDate}
              setDepartureDate={setDepartureDate}
              adults={adults}
              handleAdultsChange={handleAdultsChange}
              children={children}
              handleChildrenChange={handleChildrenChange}
              childrenAges={childrenAges}
              handleChildAgeChange={handleChildAgeChange}
              rooms={rooms}
              setRooms={setRooms}
              handleSearchHotels={handleSearchHotels}
            />
          </div>
        </>
      )}

      {/* Date Validation Dialog */}
      <ValidationDialog
        open={showDateDialog}
        onClose={() => setShowDateDialog(false)}
        message={dateError}
      />
    </>
  );
};

export default TripDestination;
