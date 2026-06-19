import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google is the active OAuth provider for this app.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user }) {
      await connectDB();

      // Email is required because it is the stable key for matching OAuth users.
      if (!user.email) {
        return false;
      }

      // Create the local user record on first OAuth sign-in.
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name || user.email,
          email: user.email,
          image: user.image || undefined,
        });
      }
      return true;
    },
    async jwt({ token }) {
      // Keep the Mongo user id inside the JWT so API routes can authorize ownership.
      if (token.email && !token.id) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the database id to client code without sending the full user document.
      if (session.user && typeof token.id === "string") {
        (session.user as { id?: string }).id = token.id;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
