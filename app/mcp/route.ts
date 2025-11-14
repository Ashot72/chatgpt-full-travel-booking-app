import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { validateGoogleToken, extractBearerToken } from "@/lib/oauth-google";
import { getAuthContext, setAuthContext } from "@/lib/auth-context";
import prisma from "@/lib/prisma";
import { registerSearchDestinationTool } from "./tools/searchTripDestination";
import { registerSearchHotelsByDestinationTool } from "./tools/searchHotelsByDestination";
import {
  hotelSearchParamsShape,
  type HotelSearchParamsInput,
  stripeWidgetInputShape,
  stripeWidgetInputSchema,
} from "./schemas";

const getAppsSdkCompatibleHtml = async (
  baseUrl: string,
  path: string
): Promise<string> => {
  const cacheBuster = Date.now();
  const result = await fetch(`${baseUrl}${path}?v=${cacheBuster}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
    "openai/widgetPrefersBorder": false,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");
  const hotelsHtml = await getAppsSdkCompatibleHtml(baseURL, "/hotels");
  const stripeHtml = await getAppsSdkCompatibleHtml(baseURL, "/stripe");
  const paymentsHtml = await getAppsSdkCompatibleHtml(baseURL, "/payments");

  const contentWidget: ContentWidget = {
    id: "booking-app",
    title: "Booking App UI",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading Booking App...",
    invoked: "Booking App ready",
    html: html,
    description: "Booking app for planning travel destinations and hotels.",
    widgetDomain: "https://rapidapi.com/DataCrawler/api/booking-com15",
  };

  const hotelsWidget: ContentWidget = {
    id: "bookig-app-hotels",
    title: "Hotels View",
    templateUri: "ui://widget/booking-hotels.html",
    invoking: "Loading Booking Hotels...",
    invoked: "Booking Hotels ready",
    html: hotelsHtml,
    description:
      "Displays the Booking hotels UI for a specific destination with full hotel details and availability.",
    widgetDomain: "https://rapidapi.com/DataCrawler/api/booking-com15",
  };

  const stripeWidget: ContentWidget = {
    id: "bookig-app-stripe",
    title: "Stripe Payment View",
    templateUri: "ui://widget/booking-stripe.html",
    invoking: "Loading Stripe Payment...",
    invoked: "Stripe Payment ready",
    html: stripeHtml,
    description:
      "Displays the Booking Stripe payment UI for the selected hotel and guest.",
    widgetDomain: "https://rapidapi.com/DataCrawler/api/booking-com15",
  };

  const paymentsWidget: ContentWidget = {
    id: "booking-app-payments",
    title: "Booking Payments View",
    templateUri: "ui://widget/booking-payments.html",
    invoking: "Loading Booking Payments...",
    invoked: "Booking Payments ready",
    html: paymentsHtml,
    description:
      "Shows previously recorded booking payments for the authenticated user.",
    widgetDomain: "https://rapidapi.com/DataCrawler/api/booking-com15",
  };

  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": false,
        "openai/resultCanProduceWidget": true,
        "openai/widgetAccessible": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": false,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register Hotels Widget Resource
  server.registerResource(
    "hotels-widget",
    hotelsWidget.templateUri,
    {
      title: hotelsWidget.title,
      description: hotelsWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": hotelsWidget.description,
        "openai/widgetPrefersBorder": false,
        "openai/resultCanProduceWidget": true,
        "openai/widgetAccessible": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${hotelsWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": hotelsWidget.description,
            "openai/widgetPrefersBorder": false,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": true,
            "openai/widgetDomain": hotelsWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register Payments Widget Resource
  server.registerResource(
    "payments-widget",
    paymentsWidget.templateUri,
    {
      title: paymentsWidget.title,
      description: paymentsWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": paymentsWidget.description,
        "openai/widgetPrefersBorder": false,
        "openai/resultCanProduceWidget": true,
        "openai/widgetAccessible": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${paymentsWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": paymentsWidget.description,
            "openai/widgetPrefersBorder": false,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": true,
            "openai/widgetDomain": paymentsWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register Stripe Widget Resource
  server.registerResource(
    "stripe-widget",
    stripeWidget.templateUri,
    {
      title: stripeWidget.title,
      description: stripeWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": stripeWidget.description,
        "openai/widgetPrefersBorder": false,
        "openai/resultCanProduceWidget": true,
        "openai/widgetAccessible": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${stripeWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": stripeWidget.description,
            "openai/widgetPrefersBorder": false,
            "openai/resultCanProduceWidget": true,
            "openai/widgetAccessible": true,
            "openai/widgetDomain": stripeWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Display the interactive Booking App UI widget. Common triggers include phrases like 'show/open booking UI', 'can you show the travel planner?', 'I want to plan my holiday', 'help me book a trip', or 'let's start planning a vacation'.",
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe("Optional label for the booking app display"),
      },
      _meta: widgetMeta(contentWidget),
      annotations: {
        destructiveHint: false,
        openWorldHint: false,
        readOnlyHint: true,
      },
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: "✈️ Booking App loaded!\n\nI can help you search for travel destinations with:\n• Available cities and regions\n• Current hotel availability\n• Visa requirements and travel tips\n• Best seasons to visit\n• Popular highlights and attractions\n\nJust tell me where you want to go!",
          },
        ],
        structuredContent: {
          name: name || "Booking App",
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );

  // Register Hotels View Tool
  server.registerTool(
    hotelsWidget.id,
    {
      title: hotelsWidget.title,
      description: hotelsWidget.description,
      inputSchema: hotelSearchParamsShape,
      _meta: widgetMeta(hotelsWidget),
      annotations: {
        destructiveHint: false,
        openWorldHint: false,
        readOnlyHint: true,
      },
    },
    async (params: HotelSearchParamsInput) => {
      const stayRange = `${params.arrival_date} → ${params.departure_date}`;
      return {
        content: [
          {
            type: "text",
            text: `🏨 Showing hotels for destination ${params.dest_id} (${stayRange}).`,
          },
        ],
        structuredContent: {
          searchParams: params,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(hotelsWidget),
      };
    }
  );

  // Register Stripe Payment Tool
  server.registerTool(
    stripeWidget.id,
    {
      title: stripeWidget.title,
      description: stripeWidget.description,
      inputSchema: stripeWidgetInputShape,
      _meta: widgetMeta(stripeWidget),
      annotations: {
        destructiveHint: false,
        openWorldHint: false,
        readOnlyHint: true,
      },
    },
    async (input: z.infer<typeof stripeWidgetInputSchema>) => {
      const { hotel, email } = input;
      return {
        content: [
          {
            type: "text",
            text: `💳 Stripe Payment loaded for ${hotel.property.name}!`,
          },
        ],
        structuredContent: {
          hotel,
          email,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(stripeWidget),
      };
    }
  );

  server.registerTool(
    "Show Booking Payments",
    {
      title: paymentsWidget.title,
      description: paymentsWidget.description,
      inputSchema: {},
      _meta: widgetMeta(paymentsWidget),
      annotations: {
        destructiveHint: false,
        openWorldHint: false,
        readOnlyHint: true,
      },
    },
    async () => {
      try {
        const authContext = getAuthContext();
        const email = authContext?.email;

        if (!email) {
          return {
            content: [
              {
                type: "text" as const,
                text: "❌ User is not authenticated. Please sign in to view your booking payments.",
              },
            ],
            isError: true,
          };
        }

        const userWithPayments = await prisma.user.findUnique({
          where: { email },
          include: {
            payments: {
              orderBy: { createdAt: "desc" },
              take: 50,
            },
          },
        });

        if (!userWithPayments) {
          return {
            content: [
              {
                type: "text" as const,
                text: "❌ No user found for the authenticated email. Please complete a payment first.",
              },
            ],
            isError: true,
          };
        }

        const payments = userWithPayments.payments.map((payment) => ({
          id: payment.id,
          price: payment.price,
          currency: payment.currency,
          hotelName: payment.hotelName,
          checkinDate: payment.checkinDate?.toISOString(),
          checkoutDate: payment.checkoutDate?.toISOString(),
          photoUrl: payment.photoUrl ?? null,
          createdAt: payment.createdAt?.toISOString(),
        }));

        return {
          content: [
            {
              type: "text" as const,
              text:
                payments.length > 0
                  ? `💳 Retrieved ${payments.length} booking payment${payments.length === 1 ? "" : "s"} for ${email}.`
                  : `ℹ️ No booking payments found for ${email}.`,
            },
          ],
          structuredContent: {
            payments,
            email,
            count: payments.length,
            limit: 50,
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(paymentsWidget),
        };
      } catch (error) {
        console.error(
          "[Show Booking Payments] Failed to fetch payments",
          error
        );
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ Failed to retrieve booking payments: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register all booking tools
  registerSearchDestinationTool(server);
  registerSearchHotelsByDestinationTool(server);
});

/**
 * Google OAuth Authentication Wrapper
 */
async function authenticatedHandler(request: NextRequest) {
  // Check if this is a tools/list request (allow without auth for discovery)
  try {
    const body = await request.text();
    const jsonBody = body ? JSON.parse(body) : {};

    // Allow unauthenticated tools/list for widget discovery
    if (jsonBody.method === "tools/list") {
      const newRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: body,
      });
      const response = await handler(newRequest);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    // Recreate request for other methods
    request = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : body,
    }) as NextRequest;
  } catch (e) {
    console.error("Error parsing request:", e);
  }

  // Extract and validate Bearer token
  const authHeader = request.headers.get("Authorization");
  const token = extractBearerToken(authHeader);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || baseURL;

  if (!token) {
    return NextResponse.json(
      { error: "invalid_token", error_description: "Authentication required" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer realm="${baseUrl}/mcp", error="invalid_token", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Validate Google OAuth token
  const tokenInfo = await validateGoogleToken(token);

  if (!tokenInfo) {
    return NextResponse.json(
      {
        error: "invalid_token",
        error_description: "Invalid or expired access token",
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": `Bearer realm="${baseUrl}/mcp", error="invalid_token", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  console.log("✅ Authenticated:", tokenInfo.email);

  if (tokenInfo.email) {
    try {
      const { ensureUser } = await import("@/app/mcp/db");

      const result = await ensureUser(tokenInfo.email);

      if (result.success) {
        if (result.created) {
          console.log("📝 Created new user:", result.user?.email);
        } else {
          console.log("✅ User found in database:", result.user?.id);
        }
      }
    } catch (dbError) {
      console.error("⚠️ Database user check failed:", dbError);
      // Continue anyway - auth context will use Google's userId
    }
  }

  // Set auth context for tools to access
  setAuthContext({
    email: tokenInfo.email,
    userId: tokenInfo.sub,
    scope: tokenInfo.scope,
  });

  const response = await handler(request);
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export const GET = authenticatedHandler;
export const POST = authenticatedHandler;
