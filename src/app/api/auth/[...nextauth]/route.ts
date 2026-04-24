import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  ...authOptions,
  events: {
    async createUser({ user }) {
      console.log("✅ USER CREATED:", user);
    },
    async signIn({ user, account }) {
      console.log("✅ SIGN IN:", { user, account });
    },
    async session({ session }) {
      console.log("✅ SESSION:", session);
    },
    async linkAccount({ user, account }) {
      console.log("✅ ACCOUNT LINKED:", { user, account });
    },
  },
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account, profile }) {
      console.log("🔍 SIGN IN CALLBACK:", { 
        user, 
        accountProvider: account?.provider 
      });
      try {
        // Manually save user to test
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        console.log("🔍 EXISTING USER:", existingUser);
      } catch (err) {
        console.error("🔴 ERROR:", err);
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };