import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * OAuth Dynamic Client Registration (RFC 7591)
 * Allows ChatGPT to register as an OAuth client automatically
 */

// In-memory storage for registered clients (use database in production)
const registeredClients = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.redirect_uris ||
      !Array.isArray(body.redirect_uris) ||
      body.redirect_uris.length === 0
    ) {
      return NextResponse.json(
        {
          error: "invalid_redirect_uri",
          error_description: "redirect_uris is required and must be an array",
        },
        { status: 400 }
      );
    }

    // Generate client credentials
    const client_id = crypto.randomBytes(16).toString("hex");
    const client_secret = crypto.randomBytes(32).toString("hex");
    const registration_access_token = crypto.randomBytes(32).toString("hex");

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || request.headers.get("host");
    const registration_client_uri = `${baseUrl}/oauth/register/${client_id}`;

    // Store client information
    const clientInfo = {
      client_id,
      client_secret,
      redirect_uris: body.redirect_uris,
      grant_types: body.grant_types || ["authorization_code", "refresh_token"],
      response_types: body.response_types || ["code"],
      client_name: body.client_name || "ChatGPT MCP Client",
      scope: body.scope || "openid email profile",
      token_endpoint_auth_method:
        body.token_endpoint_auth_method || "client_secret_basic",
      registration_access_token,
      created_at: Date.now(),
    };

    registeredClients.set(client_id, clientInfo);

    // Return registration response
    return NextResponse.json(
      {
        client_id,
        client_secret,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_secret_expires_at: 0, // Never expires
        redirect_uris: clientInfo.redirect_uris,
        grant_types: clientInfo.grant_types,
        response_types: clientInfo.response_types,
        client_name: clientInfo.client_name,
        token_endpoint_auth_method: clientInfo.token_endpoint_auth_method,
        registration_access_token,
        registration_client_uri,
      },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Client registration error:", error);
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Failed to parse registration request",
      },
      { status: 400 }
    );
  }
}

// Get client information
export async function GET(request: NextRequest) {
  const client_id = request.nextUrl.pathname.split("/").pop();

  if (!client_id || !registeredClients.has(client_id)) {
    return NextResponse.json(
      {
        error: "invalid_client",
        error_description: "Client not found",
      },
      { status: 404 }
    );
  }

  const client = registeredClients.get(client_id);

  return NextResponse.json({
    client_id: client.client_id,
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
    response_types: client.response_types,
    client_name: client.client_name,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
  });
}

// Export the clients map for use in other modules
export function getRegisteredClient(client_id: string) {
  return registeredClients.get(client_id);
}
