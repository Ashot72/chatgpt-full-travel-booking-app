/**
 * Google OAuth Token Validation
 */

export interface GoogleTokenInfo {
  azp: string;
  aud: string;
  sub: string;
  scope: string;
  exp: number;
  expires_in: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

/**
 * Validate Google OAuth access token
 */
export async function validateGoogleToken(
  accessToken: string,
): Promise<GoogleTokenInfo | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
    );

    if (!response.ok) return null;

    const tokenInfo: GoogleTokenInfo = await response.json();

    // Check if token is expired
    if (tokenInfo.exp && tokenInfo.exp < Date.now() / 1000) {
      return null;
    }

    return tokenInfo;
  } catch (error) {
    console.error("Error validating Google token:", error);
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}
