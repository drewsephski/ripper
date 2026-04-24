import { createAuthClient } from "better-auth/react";

// Type for the auth client (prevents non-portable type inference issues)
type AuthClient = ReturnType<typeof createAuthClient>;

// Create the auth client with proper configuration for Next.js
export const authClient: AuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  fetchOptions: {
    credentials: "include",
  },
});

// Export all auth methods from the client
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  getSession,
  revokeSession,
  revokeSessions,
  updateSession,
} = authClient;

// Debug helper to check cookies
export const debugCookies = () => {
  if (typeof document !== "undefined") {
    console.log("[Auth Debug] All cookies:", document.cookie);
    console.log("[Auth Debug] Session cookie:", document.cookie.split(';').find(c => c.trim().startsWith('better-auth')));
  }
};

// Helper to check if user is authenticated (returns boolean)
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    return !!session.data;
  } catch (error) {
    console.error("[Auth] isAuthenticated check failed:", error);
    return false;
  }
};
