import { bookingApi } from "@/lib/booking_api";
import { getAuthContext } from "@/lib/auth-context";
import type { HotelData, HotelSearchParams } from "@/lib/types";
import { z } from "zod";

const hotelSearchSchema = {
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
};

export async function searchHotelsByDestination(
  params: HotelSearchParams,
): Promise<HotelData> {
  return bookingApi.searchHotels(params);
}

export function registerSearchHotelsByDestinationTool(server: any) {
  server.registerTool(
    "Get Hotels By Destination",
    {
      title: "Get Hotels By Destination",
      description:
        "Look up hotels for a destination. Returns a list of hotels with all information.",
      inputSchema: hotelSearchSchema,
    },
    async (args: HotelSearchParams) => {
      try {
        const authContext = getAuthContext();
        if (!authContext?.email) {
          return {
            content: [
              {
                type: "text" as const,
                text: "❌ User not authenticated.",
              },
            ],
            isError: true,
          };
        }

        const hotelData = await searchHotelsByDestination(args);
        const hotels = hotelData?.data?.hotels ?? [];

        return {
          content: [
            {
              type: "text" as const,
              text: `🏨 Found ${hotels.length} hotels for destination ${args.dest_id}.`,
            },
          ],
          structuredContent: {
            hotels,
            email: authContext.email,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Failed to fetch hotels: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
