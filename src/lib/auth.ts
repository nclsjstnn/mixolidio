import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from './mongoose';
import User from './models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          if (!user.email) {
            console.error('No email provided by Google');
            return false;
          }

          await dbConnect();

          const existingUser = await User.findOne({ googleId: account.providerAccountId });

          if (!existingUser) {
            // Create new user without username
            await User.create({
              googleId: account.providerAccountId,
              email: user.email,
              username: null,
            });
          }

          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.googleId = dbUser.googleId;
          token.username = dbUser.username;
        }
      }

      // Refresh username on each token refresh (in case it was just set)
      if (token.userId) {
        await dbConnect();
        const dbUser = await User.findById(token.userId);
        if (dbUser) {
          token.username = dbUser.username;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.userId;
        (session.user as Record<string, unknown>).googleId = token.googleId;
        (session.user as Record<string, unknown>).username = token.username;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
