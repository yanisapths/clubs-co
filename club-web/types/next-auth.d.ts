// types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    username: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
    user: DefaultUser & { id: string };
  }

  interface User extends DefaultUser {
    username: string;
    first_name: string;
    last_name: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
  }
}
