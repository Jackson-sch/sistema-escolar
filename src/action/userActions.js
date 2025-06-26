"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

/**
 * Obtiene usuarios por rol para una institución específica
 * @param {string} institucionId - ID de la institución
 * @param {string} rol - Rol de usuario a filtrar (ADMIN, DIRECTOR, PROFESOR, etc.)
 * @returns {Promise<Object>} Respuesta con éxito o error
 */
export async function getUsuariosByRol(institucionId, rol) {
  try {
    if (!institucionId) {
      return { success: false, error: "ID de institución no proporcionado" };
    }

    // Validar el rol usando Zod
    const rolSchema = z.enum(["ADMIN", "DIRECTOR", "PROFESOR", "ESTUDIANTE", "PADRE", "SECRETARIA", "TESORERO"]);
    try {
      rolSchema.parse(rol);
    } catch (error) {
      return { success: false, error: "Rol inválido" };
    }
    
    // Convertir el rol a minúsculas para que coincida con el enum de Prisma
    let rolPrisma;
    switch(rol) {
      case "PROFESOR":
        rolPrisma = "profesor";
        break;
      case "ESTUDIANTE":
        rolPrisma = "estudiante";
        break;
      case "DIRECTOR":
        rolPrisma = "director";
        break;
      case "PADRE":
        rolPrisma = "padre";
        break;
      case "ADMIN":
      case "SECRETARIA":
      case "TESORERO":
        rolPrisma = "administrativo"; // Estos roles pueden mapearse a administrativo
        break;
      default:
        return { success: false, error: "Rol no soportado en el esquema de Prisma" };
    }

    // Buscar usuarios con el rol especificado
    const usuarios = await prisma.user.findMany({
      where: {
        institucionId,
        role: rolPrisma,
        estado: "activo", // Usar el valor correcto del enum EstadoUsuario
      },
      select: {
        id: true,
        name: true,
        email: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        role: true,
        cargo: true,
        imagen: true,
      },
      orderBy: [
        { apellidoPaterno: 'asc' },
        { apellidoMaterno: 'asc' },
        { name: 'asc' }
      ],
    });

    return { success: true, data: usuarios };
  } catch (error) {
    console.error("Error al obtener usuarios por rol:", error);
    return { success: false, error: "Error al obtener usuarios por rol" };
  }
}

/**
 * Obtiene todos los usuarios de una institución
 * @param {string} institucionId - ID de la institución
 * @returns {Promise<Object>} Respuesta con éxito o error
 */
export async function getUsuarios(institucionId) {
  try {
    if (!institucionId) {
      return { success: false, error: "ID de institución no proporcionado" };
    }

    const usuarios = await prisma.user.findMany({
      where: {
        institucionId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        role: true,
        cargo: true,
        imagen: true,
        estado: true,
        _count: {
          select: {
            permisos: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { apellidoPaterno: 'asc' },
        { name: 'asc' }
      ],
    });

    return { success: true, data: usuarios };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return { success: false, error: "Error al obtener usuarios" };
  }
}

/**
 * Crea un nuevo usuario
 * @param {Object} data - Datos del usuario
 * @returns {Promise<Object>} Respuesta con éxito o error
 */
export async function createUsuario(data) {
  try {
    // Validación básica
    if (!data.name || !data.email || !data.role || !data.institucionId) {
      return { success: false, error: "Faltan campos requeridos" };
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: "El email ya está en uso" };
    }

    // Crear usuario
    const usuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        apellidoPaterno: data.apellidoPaterno || "",
        apellidoMaterno: data.apellidoMaterno || "",
        role: data.role,
        cargo: data.cargo || null,
        estado: data.estado || "ACTIVO",
        institucionId: data.institucionId,
        // Otros campos según sea necesario
      },
    });

    // Revalidar ruta
    revalidatePath("/config/usuarios-permisos");

    return { success: true, data: usuario };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { success: false, error: "Error al crear usuario" };
  }
}

/**
 * Actualiza un usuario existente
 * @param {string} id - ID del usuario
 * @param {Object} data - Datos actualizados
 * @returns {Promise<Object>} Respuesta con éxito o error
 */
export async function updateUsuario(id, data) {
  try {
    if (!id) {
      return { success: false, error: "ID de usuario no proporcionado" };
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Verificar si el email ya está en uso por otro usuario
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return { success: false, error: "El email ya está en uso por otro usuario" };
      }
    }

    // Actualizar usuario
    const usuario = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        role: data.role,
        cargo: data.cargo,
        estado: data.estado,
        // Otros campos según sea necesario
      },
    });

    // Revalidar ruta
    revalidatePath("/config/usuarios-permisos");

    return { success: true, data: usuario };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: "Error al actualizar usuario" };
  }
}

/**
 * Elimina un usuario
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Respuesta con éxito o error
 */
export async function deleteUsuario(id) {
  try {
    if (!id) {
      return { success: false, error: "ID de usuario no proporcionado" };
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            permisos: true,
            cursos: true,
            estudiantes: true,
          },
        },
      },
    });

    if (!existingUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Si tiene datos relacionados, inactivar en lugar de eliminar
    if (existingUser._count.permisos > 0 || 
        existingUser._count.cursos > 0 || 
        existingUser._count.estudiantes > 0) {
      
      const usuario = await prisma.user.update({
        where: { id },
        data: {
          estado: "INACTIVO",
        },
      });

      revalidatePath("/config/usuarios-permisos");
      return { 
        success: true, 
        data: usuario,
        message: "El usuario tiene datos asociados. Se ha inactivado en lugar de eliminarlo."
      };
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id },
    });

    // Revalidar ruta
    revalidatePath("/config/usuarios-permisos");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return { success: false, error: "Error al eliminar usuario" };
  }
}
