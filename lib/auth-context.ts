/**
 * Authentication context for MCP tools
 * Stores current authenticated user info
 */

export interface AuthContext {
  email?: string;
  userId?: string;
  scope?: string;
}

// Simple in-memory storage (use AsyncLocalStorage for better isolation in production)
let currentAuthContext: AuthContext | null = null;

export function setAuthContext(context: AuthContext) {
  currentAuthContext = context;
}

export function getAuthContext(): AuthContext | null {
  return currentAuthContext;
}

export function clearAuthContext() {
  currentAuthContext = null;
}
