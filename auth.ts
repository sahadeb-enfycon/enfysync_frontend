import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
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

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://enfysync-backend.vercel.app"
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          })

          if (!res.ok) {
            return null
          }

          const data = await res.json()

          if (!data || !data.user) {
            return null
          }

          const { user: userData, access_token, refresh_token, expires_in } = data

          return {
            id: userData.id,
            email: userData.email,
            name: userData.fullName || userData.email,
            roles: userData.roles,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            ...userData
          }
        }
        catch (error) {
          if (error instanceof ZodError) {
            return null
          }
          return null
        }
      }
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: (user as any).accessToken || account.access_token,
          refreshToken: (user as any).refreshToken || account.refresh_token,
          expiresAt: Date.now() + ((user as any).expiresIn || account.expires_at || 3600) * 1000,
          roles: (user as any).roles || [],
          id: user.id as string,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.expiresAt - 60 * 1000) {
        return token
      }

      // Access token has expired, try to update it
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.enfycon.com"
        const response = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: token.refreshToken,
          }),
        })

        const tokens = await response.json()

        if (!response.ok) throw tokens

        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
          expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
        }
      } catch (error) {
        console.error("Error refreshing access token", error)
        return { ...token, error: "RefreshTokenError" }
      }
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