import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log("🔍 SIGN IN CALLBACK:", { user, account });
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      console.log("✅ USER CREATED:", user);
    },
    async signIn({ user, account }) {
      console.log("✅ SIGN IN EVENT:", { user, account });
    },
    async session({ session }) {
      console.log("✅ SESSION EVENT:", session);
    },
  },
  logger: {
    error(code, metadata) {
      console.error("🔴 NEXTAUTH ERROR:", code, metadata);
    },
    warn(code) {
      console.warn("⚠️ NEXTAUTH WARN:", code);
    },
    debug(code, metadata) {
      console.log("🔵 NEXTAUTH DEBUG:", code, metadata);
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
};