import  bcrypt from 'bcrypt';
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./features/auth/schemas";
import { getUserByEmail } from "./actions/get-user-by-email";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await getUserByEmail(email);
        if (!user || !user.password) return null;

        const match = await bcrypt.compare(password, user.password);
        if (!match) return null;

        return {
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
          email: user.email,
          image: user.avatar ?? null,
        };
      },
    }),
  ],
    pages: {
    signIn: "/auth/login",
  },
})