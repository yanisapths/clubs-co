/* eslint-disable @typescript-eslint/no-explicit-any */
// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                identifier: credentials.identifier,
                password: credentials.password,
              }),
            },
          );
          if (!res.ok) return null;

          const json = await res.json();
          // unwrap nested response
          if (!json.success) return null;

          const { user, tokens } = json.data;

          // return shape that maps into JWT callback
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
  ],

  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on first sign-in
      if (user) {
        token.id = user.id as string;
        token.username = (user as any).username as string;
        token.displayName = (user as any).displayName as string;
        token.accessToken = (user as any).accessToken as string;
        token.refreshToken = (user as any).refreshToken as string;
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
