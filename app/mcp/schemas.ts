import { z } from "zod";

export const hotelSearchParamsShape = {
  arrival_date: z.string().describe("Arrival date (YYYY-MM-DD)"),
  departure_date: z.string().describe("Departure date (YYYY-MM-DD)"),
  dest_id: z.string().describe("Destination identifier"),
  search_type: z.string().describe("Destination type (e.g. city, region)"),
  adults: z
    .number()
    .int()
    .nonnegative()
    .describe("Number of adults travelling"),
  children_age: z
    .union([
      z
        .array(z.number().int().min(0).max(17))
        .describe("Array of children ages"),
      z.string().describe("Serialized children ages"),
    ])
    .optional(),
  room_qty: z.number().int().positive().describe("Number of rooms requested"),
  currency_code: z.string().describe("Currency code (ISO 4217)"),
  location: z.string().describe("Traveller location or market"),
  languagecode: z.string().describe("Preferred language code"),
  temperature_unit: z.string().describe("Temperature unit (c/f)"),
  units: z.string().describe("Measurement units (metric/imperial)"),
  page_number: z.number().int().positive().describe("Pagination page number"),
} as const;

export const hotelSearchParamsSchema = z.object(hotelSearchParamsShape);

export type HotelSearchParamsInput = z.infer<typeof hotelSearchParamsSchema>;

const hotelPropertyShape = {
  id: z.number(),
  name: z.string(),
  ufi: z.number(),
  countryCode: z.string(),
  currency: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  position: z.number(),
  rankingPosition: z.number(),
  reviewCount: z.number(),
  reviewScore: z.number(),
  reviewScoreWord: z.string(),
  accuratePropertyClass: z.number(),
  propertyClass: z.number(),
  qualityClass: z.number(),
  isPreferred: z.boolean().optional(),
  isFirstPage: z.boolean(),
  wishlistName: z.string(),
  checkin: z.object({
    fromTime: z.string(),
    untilTime: z.string(),
  }),
  checkout: z.object({
    fromTime: z.string(),
    untilTime: z.string(),
  }),
  checkinDate: z.string(),
  checkoutDate: z.string(),
  photoUrls: z.array(z.string()),
  mainPhotoId: z.number(),
  priceBreakdown: z
    .object({
      grossPrice: z.object({
        currency: z.string(),
        value: z.number(),
      }),
      strikethroughPrice: z
        .object({
          currency: z.string(),
          value: z.number(),
        })
        .optional(),
      benefitBadges: z.array(z.unknown()),
      taxExceptions: z.array(z.unknown()),
      excludedPrice: z
        .object({
          currency: z.string(),
          value: z.number(),
        })
        .optional(),
    })
    .passthrough(),
  blockIds: z.array(z.string()),
  optOutFromGalleryChanges: z.number(),
  hotel_id: z.union([z.string(), z.number()]).optional(),
  isPreferredPlus: z.boolean().optional(),
} as const;

const hotelPropertySchema = z.object(hotelPropertyShape).passthrough();

const hotelShape = {
  accessibilityLabel: z.string(),
  property: hotelPropertySchema,
  hotel_id: z.union([z.string(), z.number()]).optional(),
} as const;

export const hotelSchema = z.object(hotelShape).passthrough();

export const stripeWidgetInputShape = {
  hotel: hotelSchema,
  email: z
    .string()
    .describe(
      "User email associated with the selected hotel. Used for Stripe payment prefill.",
    )
    .optional(),
} as const;

export const stripeWidgetInputSchema = z.object(stripeWidgetInputShape);
