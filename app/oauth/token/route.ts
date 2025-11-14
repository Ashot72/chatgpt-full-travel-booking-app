import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const grant_type = body.get("grant_type")?.toString();
    const code = body.get("code")?.toString();
    const refresh_token = body.get("refresh_token")?.toString();

    console.log("🔐 Token request:", {
      grant_type,
      code: code ? code.substring(0, 10) + "..." : undefined,
      refresh_token: refresh_token
        ? refresh_token.substring(0, 6) + "..."
        : undefined,
    });

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      console.error("❌ Missing Google OAuth credentials");
      return NextResponse.json(
        {
          error: "server_error",
          error_description: "OAuth client not configured",
        },
        { status: 500 }
      );
    }

    if (grant_type === "refresh_token") {
      if (!refresh_token) {
        return NextResponse.json(
          {
            error: "invalid_request",
            error_description: "Missing refresh_token",
          },
          { status: 400 }
        );
      }

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token,
          client_id: googleClientId,
          client_secret: googleClientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error("❌ Google refresh token exchange failed:", error);
        return NextResponse.json(error, { status: tokenResponse.status });
      }

      const tokens = await tokenResponse.json();

      let normalizedScope = tokens.scope;
      if (normalizedScope) {
        normalizedScope = normalizedScope
          .replace(/https:\/\/www\.googleapis\.com\/auth\//g, "")
          .replace(/userinfo\./g, "")
          .trim();
      }

      return NextResponse.json(
        {
          access_token: tokens.access_token,
          token_type: tokens.token_type ?? "Bearer",
          expires_in: tokens.expires_in,
          scope: normalizedScope || "openid email profile",
          ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            Pragma: "no-cache",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (grant_type !== "authorization_code") {
      return NextResponse.json(
        { error: "unsupported_grant_type" },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "invalid_request", error_description: "Missing code" },
        { status: 400 }
      );
    }

    // Get stored Google auth code
    const { consumeAuthCode } = await import("../callback/route");
    const authData = consumeAuthCode(code);

    if (!authData) {
      console.error(
        "❌ Auth code not found or already consumed:",
        code?.substring(0, 10)
      );
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Invalid or expired authorization code",
        },
        { status: 400 }
      );
    }

    console.log("✅ Auth code found, exchanging with Google...");

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    // Exchange Google's code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authData.google_code,
        redirect_uri: `${baseUrl}/oauth/callback`,
        client_id: googleClientId!,
        client_secret: googleClientSecret!,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error("❌ Google token exchange failed:", error);
      return NextResponse.json(error, { status: tokenResponse.status });
    }

    console.log("✅ Successfully exchanged token with Google");

    const tokens = await tokenResponse.json();

    // Normalize scope format for ChatGPT compatibility
    let normalizedScope = tokens.scope;
    if (normalizedScope) {
      normalizedScope = normalizedScope
        .replace(/https:\/\/www\.googleapis\.com\/auth\//g, "")
        .replace(/userinfo\./g, "")
        .trim();
    }

    // Return clean OAuth response
    return NextResponse.json(
      {
        access_token: tokens.access_token,
        token_type: "Bearer",
        expires_in: tokens.expires_in,
        scope: normalizedScope || "openid email profile",
        ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Pragma: "no-cache",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Token endpoint error:", error);
    return NextResponse.json(
      { error: "server_error", error_description: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
