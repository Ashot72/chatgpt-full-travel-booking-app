import { useState } from "react";
import { Hotel } from "@/lib/types";
import ValidationDialog from "../shared/validationDialog";

interface HotelDetailsPanelProps {
  selectedHotel: Hotel | undefined;
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedHotel: (hotel: Hotel | undefined) => void;
  isSelectionDisabled?: boolean;
  onSelectHotel?: (hotel: Hotel) => void;
  onClose?: () => Promise<void> | void;
  requestDisplayMode?: (
    mode: "inline" | "fullscreen",
  ) => Promise<{ mode: string } | undefined>;
}

const HotelDetailsPanel = ({
  selectedHotel,
  open,
  setOpen,
  setSelectedHotel,
  isSelectionDisabled = false,
  onSelectHotel,
  onClose,
}: HotelDetailsPanelProps) => {
  if (!open || !selectedHotel) {
    return null;
  }

  const hasPhoto = Boolean(selectedHotel.property.photoUrls?.length);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  function generateOSMTileURL(lat: number, lon: number, zoom: number = 14) {
    const latRad = (lat * Math.PI) / 180;
    const n = 2 ** zoom;
    const tileX = Math.floor(((lon + 180) / 360) * n);
    const tileY = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
        n,
    );
    return `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
  }

  const handleClose = async () => {
    if (onClose) {
      await onClose();
    } else {
      setOpen(false);
      setSelectedHotel(undefined);
    }
  };

  const handleSubmit = () => {
    if (!termsAccepted) {
      setShowTermsDialog(true);
      return;
    }
    if (onSelectHotel) {
      onSelectHotel(selectedHotel);
    }
    void handleClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[1045] bg-black/25 backdrop-blur-sm"
        onClick={() => {
          void handleClose();
        }}
      />
      <aside className="fixed inset-y-0 right-0 z-[1050] w-full max-w-[399px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900">
        <div className="flex h-full flex-col px-6 py-6 pr-3">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex-1 text-center text-lg font-semibold text-gray-800">
              Hotel Details
            </h2>
            <button
              type="button"
              aria-label="Close panel"
              onClick={() => {
                void handleClose();
              }}
              className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ✕
            </button>
          </div>

          {/* Hotel Image */}
          <div className="mb-6">
            {hasPhoto ? (
              <img
                src={selectedHotel.property.photoUrls[0]}
                alt={selectedHotel.property.name}
                className="h-52 w-full rounded-xl object-cover"
                onError={(event) => {
                  const target = event.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextSibling as HTMLElement | null;
                  if (fallback) {
                    fallback.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={`${hasPhoto ? "hidden" : "flex"} h-52 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 text-center text-base font-medium text-gray-500`}
            >
              No Image Available
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <h3 className="mb-4 text-center text-2xl font-semibold text-gray-900">
              {selectedHotel.property.name}
            </h3>

            {/* Hotel Rating and Reviews */}
            {selectedHotel.property.reviewScore > 0 && (
              <div className="mb-5 text-center">
                <span className="inline-flex items-center rounded-full bg-teal-500 px-3 py-1 text-sm font-semibold text-white">
                  {selectedHotel.property.reviewScore}{" "}
                  {selectedHotel.property.reviewScoreWord}
                </span>
                <p className="mt-2 text-sm text-gray-500">
                  ({selectedHotel.property.reviewCount} reviews)
                </p>
              </div>
            )}

            {/* Star Rating */}
            {selectedHotel.property.accuratePropertyClass > 0 && (
              <div className="mb-5 text-center">
                <span className="text-2xl text-amber-400">
                  {"★".repeat(selectedHotel.property.accuratePropertyClass)}
                </span>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedHotel.property.accuratePropertyClass} star hotel
                </p>
              </div>
            )}

            {/* Price Information */}
            {selectedHotel.property.priceBreakdown &&
              selectedHotel.property.priceBreakdown.grossPrice && (
                <div className="mb-6 text-center">
                  <div className="rounded-xl bg-emerald-50 px-4 py-5 text-gray-800">
                    <p className="text-2xl font-bold">
                      {
                        selectedHotel.property.priceBreakdown.grossPrice
                          .currency
                      }{" "}
                      {Math.round(
                        selectedHotel.property.priceBreakdown.grossPrice.value,
                      )}
                    </p>
                    <p className="mt-1 text-sm text-emerald-600">per night</p>
                  </div>
                </div>
              )}

            {/* Check-in/Check-out Times */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Check-in
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {selectedHotel.property.checkin.fromTime}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Check-out
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {selectedHotel.property.checkout.untilTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Hotel Information */}
            <div className="mb-6 text-center">
              <h4 className="text-base font-semibold text-black">
                ℹ️ Hotel Information
              </h4>
            </div>

            {/* Accessibility Information */}
            {selectedHotel.accessibilityLabel && (
              <div className="mb-6 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-black">
                {selectedHotel.accessibilityLabel}
              </div>
            )}

            {/* Hotel Location Map */}
            {selectedHotel.property.latitude &&
              selectedHotel.property.longitude && (
                <div className="mb-6">
                  <h4 className="mb-3 text-center text-base font-semibold text-teal-600">
                    📍 Hotel Location
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                    <img
                      src={generateOSMTileURL(
                        selectedHotel.property.latitude,
                        selectedHotel.property.longitude,
                      )}
                      alt={`Map tile showing ${selectedHotel.property.name}`}
                      className="h-[200px] w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-3 text-center text-sm">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selectedHotel.property.latitude}&mlon=${selectedHotel.property.longitude}#map=15/${selectedHotel.property.latitude}/${selectedHotel.property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-teal-600 hover:text-teal-500"
                    >
                      Open Detailed Map
                    </a>
                  </p>
                </div>
              )}

            {/* Terms and Conditions */}
            <div className="mb-6">
              <label
                htmlFor="termsCheckbox"
                className="flex cursor-pointer items-start gap-3"
              >
                <input
                  id="termsCheckbox"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
                <span className="text-sm text-gray-600">
                  I accept the{" "}
                  <a
                    href="#"
                    className="font-medium text-teal-600 hover:text-teal-500"
                  >
                    Terms and Conditions
                  </a>{" "}
                  and
                  <a
                    href="#"
                    className="font-medium text-teal-600 hover:text-teal-500"
                  >
                    {" "}
                    Privacy Policy
                  </a>
                  . By proceeding with this booking, I acknowledge that I have
                  read and agree to the hotel's cancellation policy and
                  understand that charges may apply for modifications or
                  cancellations.
                </span>
              </label>
            </div>
          </div>

          {/* Select Hotel Button - Always at bottom */}
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-300"
              onClick={handleSubmit}
              disabled={isSelectionDisabled}
            >
              ✓ Select Hotel
            </button>
          </div>
        </div>
      </aside>
      <ValidationDialog
        open={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        title="Terms Not Accepted"
        message="Please accept the Terms and Conditions and Privacy Policy before selecting this hotel."
        confirmLabel="Understood"
        overlayClassName="z-[1060]"
      />
    </>
  );
};

export default HotelDetailsPanel;
