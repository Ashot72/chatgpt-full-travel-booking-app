import { NextRequest, NextResponse } from "next/server";

// Store authorization codes temporarily
const authCodes = new Map<string, any>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth error from Google
  if (error) {
    return NextResponse.json(
      { error, error_description: searchParams.get("error_description") },
      { status: 400 }
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing code or state" },
      { status: 400 }
    );
  }

  try {
    // Decode session state to get ChatGPT's redirect URI
    const sessionData = JSON.parse(Buffer.from(state, "base64url").toString());
    const { original_redirect_uri, original_client_id, original_state } =
      sessionData;

    // Generate authorization code for ChatGPT
    const chtGPTAuthCode = Buffer.from(
      `${Date.now()}_${Math.random()}`
    ).toString("base64url");

    // Store Google's code for later token exchange
    authCodes.set(chtGPTAuthCode, {
      google_code: code,
      client_id: original_client_id,
      redirect_uri: original_redirect_uri,
      created_at: Date.now(),
    });

    // Auto-cleanup after 10 minutes
    setTimeout(() => authCodes.delete(chtGPTAuthCode), 10 * 60 * 1000);

    // Redirect back to ChatGPT
    const redirectUrl = new URL(original_redirect_uri);
    redirectUrl.searchParams.set("code", chtGPTAuthCode);
    if (original_state) {
      redirectUrl.searchParams.set("state", original_state);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        error_description: "Failed to process callback",
      },
      { status: 500 }
    );
  }
}

export function consumeAuthCode(code: string) {
  const data = authCodes.get(code);
  if (data) authCodes.delete(code);
  return data;
}
