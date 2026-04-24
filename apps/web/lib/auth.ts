import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  trustedOrigins: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ? [process.env.NEXT_PUBLIC_BETTER_AUTH_URL] : [],
  user: {
    modelName: "User",
    fields: {
      email: "email",
      name: "name",
      image: "image",
      emailVerified: "emailVerified",
    },
    additionalFields: {
      createdAt: {
        type: "date",
        required: false,
      },
    },
  },
  account: {
    modelName: "Account",
    fields: {
      accountId: "accountId",
      providerId: "providerId",
      userId: "userId",
      type: "type",
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      idToken: "idToken",
      accessTokenExpiresAt: "accessTokenExpiresAt",
      refreshTokenExpiresAt: "refreshTokenExpiresAt",
      scope: "scope",
      password: "password",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    accountLinking: {
      enabled: true,
    },
  },
  session: {
    modelName: "Session",
    fields: {
      sessionToken: "token",
      userId: "userId",
      expiresAt: "expiresAt",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      enabled: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    useSecureCookies: false,
    disableCSRFCheck: false,
    disableOriginCheck: process.env.NODE_ENV !== "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
      httpOnly: false,
      path: "/",
    },
  },
  rateLimit: {
    enabled: false,
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      attributes: {
        sameSite: "lax",
        secure: false,
        httpOnly: false,
        path: "/",
      },
    },
  },
});

export type Auth = typeof auth;
