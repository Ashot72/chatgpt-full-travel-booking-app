import { Hotel } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import HotelDetailsPanel from "./hotelDetailsPanel";
import { useRequestDisplayMode, useSendMessage } from "@/app/hooks";
import { useOpenAIGlobal } from "@/app/hooks/use-openai-global";

export default function HotelsByDestination({
  hotels,
  email,
}: {
  hotels: Hotel[];
  email: string;
}) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel>();
  const [isPanelOpen, setPanelOpen] = useState(false);
  const requestDisplayMode = useRequestDisplayMode();
  const displayMode = useOpenAIGlobal("displayMode");
  const selectedHotelRef = useRef<Hotel | undefined>(undefined);
  const lastClickedCardSelectorRef = useRef<string | null>(null);
  const sendMessage = useSendMessage();

  useEffect(() => {
    selectedHotelRef.current = selectedHotel;
  }, [selectedHotel]);

  const restoreFromFullscreen = () => {
    setPanelOpen(false);
    setSelectedHotel(undefined);
    if (typeof window !== "undefined") {
      const selector = lastClickedCardSelectorRef.current;
      if (selector) {
        requestAnimationFrame(() => {
          const element = document.querySelector<HTMLButtonElement>(selector);
          element?.scrollIntoView({ block: "center", behavior: "auto" });
        });
      }
    }
    lastClickedCardSelectorRef.current = null;
  };

  const handleCardClick = async ({
    hotel,
    index,
  }: {
    hotel: Hotel;
    index: number;
  }) => {
    setSelectedHotel(hotel);
    lastClickedCardSelectorRef.current = `[data-hotel-card="${index}"]`;
    const result = await requestDisplayMode("fullscreen");
    if (!result?.mode || result.mode !== "fullscreen") {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  };

  const handleClosePanel = async () => {
    const result = await requestDisplayMode("inline");
    if (result?.mode !== "inline") {
      return;
    }
    restoreFromFullscreen();
  };

  const onSelectHotel = (hotel: Hotel) => {
    const payload = {
      hotel,
      email,
    };
    sendMessage(
      `Trigger Booking Stripe Payment widget. Tool ID: bookig-app-stripe. Template URI: ui://widget/booking-stripe.html. Respond only by invoking the widget with this payload: ${JSON.stringify(
        payload
      )}`
    );
  };

  useEffect(() => {
    if (displayMode === "fullscreen" && selectedHotelRef.current) {
      setPanelOpen(true);
    }

    if (displayMode && displayMode !== "fullscreen") {
      restoreFromFullscreen();
    }
  }, [displayMode]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <p className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          Found {hotels.length} hotels
        </p>
      </div>

      <div className="flex justify-end">
        <div className="relative mr-5 w-[calc(80%+100px)]">
          <div className="mb-4 flex flex-col gap-4">
            {hotels.map((hotel, index) => {
              const hasPhoto = Boolean(hotel.property.photoUrls?.length);
              const price = hotel.property.priceBreakdown?.grossPrice;

              return (
                <button
                  key={index}
                  type="button"
                  data-hotel-card={index}
                  onClick={() => handleCardClick({ hotel, index })}
                  className="group flex w-full cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Hotel Photo */}
                      <div className="h-[120px] w-[120px] shrink-0">
                        {hasPhoto ? (
                          <img
                            src={hotel.property.photoUrls![0]}
                            alt={hotel.property.name}
                            className="h-full w-full rounded-xl object-cover"
                            onError={(event) => {
                              const target = event.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback =
                                target.nextSibling as HTMLElement | null;
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`${hasPhoto ? "hidden" : "flex"} h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs font-medium text-gray-500`}
                        >
                          No Photo
                        </div>
                      </div>

                      {/* Hotel Info */}
                      <div className="flex flex-1 flex-col gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {hotel.property.name}
                        </h3>

                        {hotel.property.reviewScore > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">
                              {hotel.property.reviewScore}{" "}
                              {hotel.property.reviewScoreWord}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({hotel.property.reviewCount} reviews)
                            </span>
                          </div>
                        )}

                        {hotel.property.accuratePropertyClass > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-lg text-amber-400">
                              {"★".repeat(hotel.property.accuratePropertyClass)}
                            </span>
                            <span>
                              {hotel.property.accuratePropertyClass} star hotel
                            </span>
                          </div>
                        )}

                        <div className="flex items-end justify-between gap-4">
                          <div>
                            {price && (
                              <div>
                                <span className="text-xl font-semibold text-emerald-600">
                                  {price.currency} {Math.round(price.value)}
                                </span>
                                <p className="text-sm text-gray-500">
                                  per night
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Check-in: {hotel.property.checkin.fromTime}
                            </p>
                            <p className="text-sm text-gray-500">
                              Check-out: {hotel.property.checkout.untilTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hotel Details Panel */}
      <HotelDetailsPanel
        selectedHotel={selectedHotel}
        open={isPanelOpen}
        setOpen={setPanelOpen}
        setSelectedHotel={setSelectedHotel}
        onSelectHotel={onSelectHotel}
        onClose={handleClosePanel}
      />
    </div>
  );
}
