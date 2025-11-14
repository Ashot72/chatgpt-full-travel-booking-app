import { NextResponse } from "next/server";

/**
 * OAuth Protected Resource Metadata endpoint
 * Required by ChatGPT to discover OAuth configuration
 */
export async function GET(request: Request) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

  return NextResponse.json(
    {
      resource: `${baseUrl}/mcp`,
      authorization_servers: [baseUrl],
      bearer_methods_supported: ["header"],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
