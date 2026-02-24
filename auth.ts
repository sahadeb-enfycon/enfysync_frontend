import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Keycloak from "next-auth/providers/keycloak"
import { ZodError } from "zod"
import { loginSchema } from "./lib/zod"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      roles: string[]
      accessToken: string
      email: string
      name: string
    }
    error?: "RefreshTokenError"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    refreshToken: string
    expiresAt: number
    roles: string[]
    id: string
    error?: "RefreshTokenError"
  }
}


/**
 * Calculates the next occurrence of 6:30 PM IST (13:00 UTC).
 * If the current time is already past 13:00 UTC today, it returns 13:00 UTC tomorrow.
 */
function getNextScheduledLogout(): number {
  const now = new Date();
  const scheduledTime = new Date(now);

  // Set to 13:00:00 UTC (which is 18:30:00 IST)
  scheduledTime.setUTCHours(13, 0, 0, 0);

  // If we already passed 13:00 UTC today, the next logout is tomorrow
  if (now.getTime() >= scheduledTime.getTime()) {
    scheduledTime.setUTCDate(scheduledTime.getUTCDate() + 1);
  }

  return scheduledTime.getTime();
}

// Global variable to store the refresh promise and avoid multiple simultaneous refresh calls
let refreshPromise: Promise<any> | null = null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials)

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.enfycon.com"
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
              scope: "openid profile email offline_access", // Requesting offline session for long-lived refresh tokens
            }),
          })

          if (!res.ok) {
            console.error("Login failed with status:", res.status);
            return null
          }

          const data = await res.json()

          if (!data || !data.user) {
            console.error("Invalid login response data:", data);
            return null
          }

          // DEBUG: Structure investigation
          console.log("Login successful. Data structure:", {
            keys: Object.keys(data),
            userKeys: Object.keys(data.user),
            hasAccessToken: !!data.access_token,
            hasRefreshToken: !!data.refresh_token,
            accessTokenPrefix: data.access_token?.substring(0, 10),
            refreshTokenPrefix: data.refresh_token?.substring(0, 10),
          });

          const { user: userData, access_token, refresh_token, expires_in } = data

          return {
            ...userData, // Spread first so explicit fields overwrite if there's a conflict
            id: userData.id,
            email: userData.email,
            name: userData.fullName || userData.email,
            roles: userData.roles,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
          }
        }
        catch (error) {
          console.error("Authorization error:", error);
          if (error instanceof ZodError) {
            return null
          }
          return null
        }
      }
    }),
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email offline_access"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours fallback
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        let expiresAt = Date.now() + 3600 * 1000; // Default 1 hour

        if ((user as any).expiresIn) {
          // From Credentials provider
          expiresAt = Date.now() + (user as any).expiresIn * 1000;
        } else if (account.expires_at) {
          // From OAuth providers
          expiresAt = account.expires_at * 1000;
        }

        // CAP EXPIRE AT TO NEXT 6:30 PM IST (13:00 UTC)
        const scheduledLogout = getNextScheduledLogout();
        if (expiresAt > scheduledLogout) {
          expiresAt = scheduledLogout;
        }

        console.log("Initial sign-in successful.", {
          userId: user.id,
          hasAccessToken: !!((user as any).accessToken || account.access_token),
          hasRefreshToken: !!((user as any).refreshToken || account.refresh_token),
          expiresAt: new Date(expiresAt).toISOString(),
          scheduledLogout: new Date(scheduledLogout).toISOString()
        });

        return {
          ...token,
          accessToken: (user as any).accessToken || account.access_token,
          refreshToken: (user as any).refreshToken || account.refresh_token,
          expiresAt,
          roles: (user as any).roles || [],
          id: user.id as string,
        }
      }

      // Return previous token if the access token has not expired yet
      // Refresh 30 seconds before expiry for safety
      if (Date.now() < token.expiresAt - 30 * 1000) {
        return token
      }

      // Access token has expired, try to update it
      // Use a shared promise to prevent race conditions during refresh
      if (refreshPromise) {
        console.log("Waiting for existing refresh promise...");
        return await refreshPromise;
      }

      console.log("Refresh required. Token state:", {
        now: new Date().toISOString(),
        expiresAt: new Date(token.expiresAt).toISOString(),
        hasRefreshToken: !!token.refreshToken
      });

      refreshPromise = (async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.enfycon.com"
          // Using the exact URL format provided by the user (double slash after domain)
          const refreshUrl = `${apiUrl}//auth/refresh`;

          console.log(`Attempting refresh at ${refreshUrl}...`, {
            tokenType: typeof token.refreshToken,
            tokenLength: token.refreshToken?.length,
            tokenPrefix: token.refreshToken?.substring(0, 15)
          });

          const response = await fetch(refreshUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh_token: token.refreshToken,
              refreshToken: token.refreshToken, // Alias in case the backend uses camelCase
              grant_type: "refresh_token",      // Common OIDC field
            }),
          })

          const tokens = await response.json()

          if (!response.ok) {
            console.error("Refresh token API error details:", {
              status: response.status,
              url: refreshUrl,
              body: tokens
            });
            throw tokens;
          }

          let expiresAt = Date.now() + (tokens.expires_in ?? 300) * 1000;

          const scheduledLogout = getNextScheduledLogout();
          if (expiresAt > scheduledLogout) {
            expiresAt = scheduledLogout;
          }

          console.log("Successfully refreshed token. New expiry:", new Date(expiresAt).toISOString());

          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
            expiresAt,
            error: null // Clear any previous error
          }
        } catch (error) {
          console.error("Failed to refresh access token:", error)
          return { ...token, error: "RefreshTokenError" }
        } finally {
          refreshPromise = null;
        }
      })();

      return await refreshPromise;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.roles = token.roles
        session.user.accessToken = token.accessToken
        session.error = token.error
      }
      return session
    },
  },
})
