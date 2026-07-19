/* eslint-disable @typescript-eslint/no-explicit-any */
// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function exchangeGoogleIdToken(idToken: string) {
  const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    throw new Error("google exchange failed");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error("google exchange failed");
  }

  return json.data as {
    user: { id: string; email: string; username: string; displayName: string };
    tokens: { access_token: string; refresh_token: string };
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        identifier: {
          label: "Email or Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;

          const json = await res.json();
          if (!json.success) return null;

          const { user, tokens } = json.data;

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === "credentials") {
        token.id = user.id as string;
        token.username = (user as any).username as string;
        token.displayName = (user as any).displayName as string;
        token.accessToken = (user as any).accessToken as string;
        token.refreshToken = (user as any).refreshToken as string;
        delete token.error;
        return token;
      }

      if (account?.provider === "google" && account.id_token) {
        try {
          const result = await exchangeGoogleIdToken(account.id_token);
          token.id = result.user.id;
          token.username = result.user.username;
          token.displayName = result.user.displayName;
          token.accessToken = result.tokens.access_token;
          token.refreshToken = result.tokens.refresh_token;
          delete token.error;
        } catch {
          token.error = "GoogleExchangeFailed";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.username = token.username as string;
        session.displayName = token.displayName as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      if (token?.error) {
        (session as any).error = token.error;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});

export async function getSession() {
  const session = await auth();
  if (!session) return null;
  return session;
}
