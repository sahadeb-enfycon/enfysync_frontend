import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Keycloak from "next-auth/providers/keycloak"
import { ZodError } from "zod"
import { loginSchema } from "./lib/zod"


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

          const { user: userData, access_token } = data

          return {
            id: userData.id,
            email: userData.email,
            name: userData.fullName || userData.email,
            roles: userData.roles,
            accessToken: access_token,
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.roles = (user as any).roles
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      // @ts-ignore
      session.user.roles = token.roles as string[]
      // @ts-ignore
      session.user.accessToken = token.accessToken as string
      return session
    },
  },
})