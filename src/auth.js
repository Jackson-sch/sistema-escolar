import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    // jwt() se ejecuta cada vez que se crea o actualiza un token JWT
    // Aquí se puede agregar información adicional al token
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id; // Asegura que el id esté en el token
        token.cargo = user.cargo;
      }
      return token;
    },
    // session() se ejecuta cada vez que se crea o actualiza una sesión
    // Lo que hace que este disponible en el cliente
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id; // Asegura que el id esté en la sesión
        session.user.cargo = token.cargo;
      }
      return session;
    },
  },

  events: {
    // El evento linkAccount se ejecuta cada vez que se vincula una cuenta de OAuth( Google, Facebook, etc)
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },

  pages: {
    signIn: "/login",
  },
});
