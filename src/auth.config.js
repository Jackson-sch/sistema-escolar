import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        const { email, password } = credentials;

        // Verifica si el usuario ya existe en la base de datos
        const user = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("El email no está asociado a ninguna cuenta");
        }

        if (!user.password) {
          throw new Error("Esta cuenta no tiene contraseña configurada");
        }

        // Verifica si la contraseña es correcta
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return user;
      },
    }),
  ],
};

export default authConfig;