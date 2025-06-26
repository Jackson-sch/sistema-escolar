"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const loginAction = async (formData) => {
  try {
    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return {
      error: "Error interno en el servidor. Por favor, intenta de nuevo.",
    };
  }
};

const registerActions = async (formData) => {
  try {
    const { name, email, password } = formData;

    // Validar los datos del formulario
    if (!name || !email || !password) {
      return { error: "Por favor, completa todos los campos." };
    }

    // Verifica si el usuario ya existe en la base de datos
    const user = await db.user.findUnique({
      where: {
        email,
      },
      include: {
        accounts: true, // Incluir las cuentas asociadas al usuario
      },
    });

    if (user) {
      // Verificar si el usuario ya tiene una cuenta de OAuth
      if (user.accounts.some((account) => account.type === "oauth")) {
        return {
          error:
            "Ya existe una cuenta vinculada a este correo electrónico. Inicia sesión con tu cuenta vinculada.",
        };
      }
      return { error: "Ya existe una cuenta con este correo electrónico." };
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: "administrativo",
        cargo: "administrador",
      },
    });

    /*     await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("✔️ Sesión iniciada automáticamente"); */

    return {
      success: true,
      message: "Registro exitoso. Redirigiendo dashboard",
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { error: "Hubo un error al registrar el usuario." };
  }
};

export async function changePassword({ userId, currentPassword, newPassword }) {
  // Buscar usuario por ID
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  // Verificar contraseña actual
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new Error("La contraseña actual es incorrecta");
  }
  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // Actualizar contraseña
  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return { success: true };
}

export { loginAction, registerActions };
