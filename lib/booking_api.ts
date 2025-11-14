import { Destination, HotelData, HotelSearchParams } from "./types";

// Lazy-load configuration from environment variables (called at runtime, not module load time)
const getApiConfig = () => {
  const API_KEY = process.env.RAPIDAPI_KEY;
  const API_HOST = process.env.RAPIDAPI_HOST || "booking-com15.p.rapidapi.com";

  // Validate required environment variables
  if (!API_KEY) {
    throw new Error(
      "RAPIDAPI_KEY environment variable is required. Please set it in your .env.local file.",
    );
  }

  return {
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST,
      "Content-Type": "application/json",
    },
  };
};

const getBaseUrl = () => {
  return (
    process.env.BOOKING_API_BASE_URL || "https://booking-com15.p.rapidapi.com"
  );
};

// Helper function to make API calls
const makeApiCall = async (
  endpoint: string,
  params: Record<string, any> = {},
) => {
  try {
    const url = new URL(`${getBaseUrl()}${endpoint}`);

    // Add query parameters
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.href, {
      method: "GET",
      headers: getApiConfig().headers,
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Booking.com API endpoints
export const bookingApi = {
  searchDestination: (query: string): Promise<Destination> => {
    return makeApiCall("/api/v1/hotels/searchDestination", { query });
  },

  searchHotels: (query: HotelSearchParams): Promise<HotelData> => {
    return makeApiCall("/api/v1/hotels/searchHotels", query);
  },
};
