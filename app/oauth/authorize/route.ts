import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth Authorization Endpoint (Proxy to Google)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const response_type = searchParams.get("response_type");
  const client_id = searchParams.get("client_id");
  const redirect_uri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope") || "openid email profile";
  const state = searchParams.get("state");

  // Validate required parameters
  if (!response_type || !client_id || !redirect_uri) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing required parameters",
      },
      { status: 400 }
    );
  }

  // Store original ChatGPT redirect info in state
  const sessionState = Buffer.from(
    JSON.stringify({
      original_redirect_uri: redirect_uri,
      original_client_id: client_id,
      original_state: state,
    })
  ).toString("base64url");

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return NextResponse.json(
      { error: "server_error", error_description: "Server not configured" },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

  // Redirect to Google OAuth
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", googleClientId);
  googleAuthUrl.searchParams.set("redirect_uri", `${baseUrl}/oauth/callback`);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", scope);
  googleAuthUrl.searchParams.set("state", sessionState);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(googleAuthUrl.toString());
}
