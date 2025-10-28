import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getSupabase } from '../../../lib/supabaseClient';
import bcrypt from 'bcrypt';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        try {
          const supabase = getSupabase();

          // Fetch user from your custom users table
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', credentials.username)
            .single();

          if (error || !user) {
            console.error('Error fetching user:', error);
            return null;
          }

        // Compare the provided password with the stored hash
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (isValid) {
          // Return a user object for the session
          return { id: user.id, name: user.username, role: user.role };
        } else {
          return null;
        }
      } catch (e) {
        console.error('Database connection error', e);
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to the JWT
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to the session
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
