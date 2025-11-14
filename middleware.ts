import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware - allows all requests
 * OAuth authentication is handled at the /mcp route level
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
