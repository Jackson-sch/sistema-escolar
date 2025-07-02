"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { passwordResetRequestSchema, passwordResetSchema } from "@/lib/validaciones/auth";
// Simularemos el envío de correos electrónicos por ahora
// En una implementación real, usarías un servicio como SendGrid, Nodemailer, etc.

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

// Solicitar restablecimiento de contraseña
export async function requestPasswordReset(formData) {
  try {
    // Validar el email
    const validatedFields = passwordResetRequestSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      return { error: "Email inválido" };
    }
    
    const { email } = validatedFields.data;
    
    // Buscar usuario por email
    const user = await db.user.findUnique({ where: { email } });
    
    // No revelamos si el usuario existe o no por seguridad
    if (!user) {
      // En producción, no deberías revelar si el usuario existe o no
      // Simulamos éxito para evitar ataques de enumeración
      console.log(`No se encontró usuario con email: ${email}`);
      return { success: true };
    }
    
    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Guardar token en la base de datos con expiración de 1 hora
    await db.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: hashedToken,
        expires: new Date(Date.now() + 3600000), // 1 hora
      },
      create: {
        userId: user.id,
        token: hashedToken,
        expires: new Date(Date.now() + 3600000), // 1 hora
      },
    });
    
    // En una aplicación real, aquí enviarías un email con el enlace de recuperación
    // que incluiría el token: `/recovery?token=${resetToken}`
    console.log(`Token generado para ${email}: ${resetToken}`);
    
    // Para fines de demostración, devolvemos el token (en producción NUNCA hagas esto)
    return { 
      success: true, 
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
      // Solo para demostración, eliminar en producción
      demoToken: resetToken
    };
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error);
    return { error: "Error al procesar la solicitud. Inténtalo de nuevo más tarde." };
  }
}

// Restablecer contraseña con token
export async function resetPassword(formData) {
  try {
    // Depurar los datos recibidos
    console.log("Datos recibidos en resetPassword:", formData);
    
    // Validar datos
    const validatedFields = passwordResetSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      console.log("Error de validación:", validatedFields.error.flatten());
      return { 
        error: "Datos inválidos", 
        fieldErrors: validatedFields.error.flatten().fieldErrors 
      };
    }
    
    const { token, password } = validatedFields.data;
    console.log("Token validado:", token);
    
    // Buscar token en la base de datos
    const resetTokens = await db.passwordResetToken.findMany({
      include: { user: true },
    });
    
    console.log(`Buscando coincidencia para token entre ${resetTokens.length} tokens almacenados`);
    
    // Buscar token válido
    let validTokenRecord = null;
    for (const record of resetTokens) {
      const isValid = await bcrypt.compare(token, record.token);
      if (isValid) {
        validTokenRecord = record;
        console.log("Token válido encontrado para usuario:", record.user.email);
        break;
      }
    }
    
    if (!validTokenRecord) {
      console.log("No se encontró un token válido");
      return { error: "Token inválido o expirado" };
    }
    
    // Verificar si el token ha expirado
    const now = new Date();
    if (now > validTokenRecord.expires) {
      console.log("Token expirado. Fecha actual:", now, "Expiración:", validTokenRecord.expires);
      return { error: "El token ha expirado" };
    }
    
    console.log("Token válido y no expirado. Procediendo a actualizar contraseña.");
    
    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña hasheada correctamente");
    
    try {
      // Actualizar contraseña del usuario
      const updatedUser = await db.user.update({
        where: { id: validTokenRecord.userId },
        data: { password: hashedPassword },
      });
      
      console.log("Contraseña actualizada para el usuario:", updatedUser.email);
      
      // Eliminar token usado
      await db.passwordResetToken.delete({
        where: { id: validTokenRecord.id },
      });
      
      console.log("Token eliminado correctamente");
      
      const response = { success: "Contraseña actualizada correctamente" };
      console.log("Enviando respuesta de éxito al cliente:", response);
      return response;
    } catch (updateError) {
      console.error("Error al actualizar la contraseña:", updateError);
      return { error: "Error al actualizar la contraseña en la base de datos" };
    }
  } catch (error) {
    console.error("Error general al restablecer contraseña:", error);
    return { error: "Error al restablecer contraseña" };
  }
}

export { loginAction, registerActions };
