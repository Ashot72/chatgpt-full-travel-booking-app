import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { bookingApi } from "@/lib/booking_api";
import { getAuthContext } from "@/lib/auth-context";
import { Booking } from "@/lib/types";

const searchDestinationSchema = {
  user_message: z
    .string()
    .describe(
      "The user message containing the destination they want to travel to"
    ),
};

export async function searchDestination(args: { user_message: string }) {
  // Use OpenAI to extract the location from the user's message
  const extractSchema = z.object({
    location: z
      .string()
      .describe(
        "The location to book the trip for. Can be a city, state, district, landmark or country"
      ),
  });

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  }).bindTools([
    {
      name: "search_trip_destination",
      description: "A tool to search the destination for the trip",
      schema: extractSchema,
    },
  ]);

  const prompt = `
          You are an AI assistant for booking trips. Your task is to extract the destination location from the user's message.

          IMPORTANT EXTRACTION RULES:
          1. Look for ANY mention of a place name in the user's message
          2. Accept cities, states, countries, districts, or regions
          3. Be flexible with spelling variations and common abbreviations
          4. Extract the most specific location mentioned (e.g., "New York" not just "York")
          5. If multiple locations are mentioned, extract the primary destination

          EXAMPLES OF VALID LOCATIONS:
          - "I want to go to Paris" → extract "Paris"
          - "Book a trip to Tokyo, Japan" → extract "Tokyo"
          - "Planning a vacation in California" → extract "California"
          - "I'd like to visit the Eiffel Tower" → extract "Eiffel Tower"
          - "Going to NYC" → extract "NYC"
          - "Travel to London, UK" → extract "London"

          ONLY respond with a clarification if NO location is mentioned at all. 
          If you find ANY location reference, extract it even if it seems unclear.
    `;

  try {
    const response = await model.invoke([
      { role: "system", content: prompt },
      { role: "human", content: args.user_message },
    ]);

    const toolCall = response.tool_calls?.[0];
    if (!toolCall) {
      return {
        success: false,
        error:
          "Could not extract location from message. Please specify a destination.",
      };
    }

    const extractDetails = toolCall.args as z.infer<typeof extractSchema>;

    // Call the booking API to search for destinations
    const destination = await bookingApi.searchDestination(
      extractDetails.location
    );

    // Get user info from auth context
    const authContext = getAuthContext();
    if (!authContext?.email) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Create new trip
    const newTrip: Booking = {
      destination: destination,
      hotels: [],
      selectedHotel: undefined,
    };

    return {
      success: true,
      extracted_location: extractDetails.location,
      trip: newTrip,
    };
  } catch (error) {
    console.error("Error searching destinations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to search destinations",
    };
  }
}

export function registerSearchDestinationTool(server: any) {
  server.registerTool(
    "Search Destination",
    {
      title: "Search Destination",
      description:
        "Complete travel destination search with comprehensive information including available cities, hotel counts, visa requirements, best travel seasons, currency info, and popular highlights. Returns everything needed for trip planning - no additional research required.",
      inputSchema: searchDestinationSchema,
    },
    async (args: { user_message: string }) => {
      try {
        const result = await searchDestination(args);

        // Check if the result indicates an error
        if (!result.success || !result.trip) {
          return {
            content: [
              {
                type: "text" as const,
                text: `❌ Error: ${(result as any).error || "Unknown error"}`,
              },
            ],
            isError: true,
          };
        }

        // Success - return destinations data
        const trip = result.trip;
        const destinations = trip.destination.data ?? [];
        const response: any = {
          content: [
            {
              type: "text" as const,
              text: `✅ Found ${destinations.length} destinations in ${result.extracted_location}`,
            },
          ],
          structuredContent: {
            data_source: "Booking.com Real-time API",
            destinations,
            extracted_location: result.extracted_location,
            timestamp: new Date().toISOString(),
          },
        };

        return response;
      } catch (error) {
        // Handle unexpected errors in the tool handler itself
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
