"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene los permisos asignados a un cargo específico
 * @param {string} cargo - Cargo a consultar (director, subdirector, etc.)
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getPermisosCargo(cargo) {
  try {
    if (!cargo) {
      return {
        success: false,
        data: [],
        error: "Se requiere especificar el cargo"
      };
    }

    // Buscar permisos asignados al cargo en la tabla UsuarioPermiso
    // donde el campo "cargo" coincide con el cargo proporcionado
    const permisosCargo = await db.permiso.findMany({
      where: {
        cargoPermisos: {
          some: {
            cargo: cargo
          }
        }
      },
      orderBy: [
        { modulo: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return {
      success: true,
      data: permisosCargo,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener permisos del cargo:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener permisos del cargo"
    };
  }
}

/**
 * Asigna un permiso a un cargo específico
 * @param {string} cargo - Cargo (director, subdirector, etc.)
 * @param {string} permisoId - ID del permiso
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function asignarPermisoCargo(cargo, permisoId) {
  try {
    if (!cargo || !permisoId) {
      return {
        success: false,
        data: null,
        error: "Se requiere el cargo y el ID del permiso"
      };
    }

    // Verificar si el permiso existe
    const permiso = await db.permiso.findUnique({
      where: { id: permisoId }
    });

    if (!permiso) {
      return {
        success: false,
        data: null,
        error: "El permiso no existe"
      };
    }

    // Verificar si el permiso ya está asignado al cargo
    const permisoCargoExistente = await db.cargoPermiso.findFirst({
      where: {
        cargo: cargo,
        permisoId: permisoId
      }
    });

    if (permisoCargoExistente) {
      return {
        success: false,
        data: null,
        error: "El permiso ya está asignado a este cargo"
      };
    }

    // Asignar permiso al cargo
    const cargoPermiso = await db.cargoPermiso.create({
      data: {
        cargo: cargo,
        permisoId: permisoId
      }
    });

    // Revalidar rutas
    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: cargoPermiso,
      error: null
    };
  } catch (error) {
    console.error("Error al asignar permiso al cargo:", error);
    return {
      success: false,
      data: null,
      error: "Error al asignar permiso al cargo"
    };
  }
}

/**
 * Revoca un permiso de un cargo específico
 * @param {string} cargo - Cargo (director, subdirector, etc.)
 * @param {string} permisoId - ID del permiso
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function revocarPermisoCargo(cargo, permisoId) {
  try {
    if (!cargo || !permisoId) {
      return {
        success: false,
        error: "Se requiere el cargo y el ID del permiso"
      };
    }

    // Buscar la relación cargo-permiso
    const cargoPermiso = await db.cargoPermiso.findFirst({
      where: {
        cargo: cargo,
        permisoId: permisoId
      }
    });

    if (!cargoPermiso) {
      return {
        success: false,
        error: "El permiso no está asignado a este cargo"
      };
    }

    // Eliminar la relación
    await db.cargoPermiso.delete({
      where: {
        id: cargoPermiso.id
      }
    });

    // Revalidar rutas
    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error al revocar permiso del cargo:", error);
    return {
      success: false,
      error: "Error al revocar permiso del cargo"
    };
  }
}

/**
 * Obtiene todos los cargos disponibles en el sistema
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getCargos() {
  try {
    // Obtener los valores del enum Cargo del modelo User
    const cargos = [
      "director",
      "subdirector",
      "coordinador_academico",
      "secretaria",
      "administrador",
      "auxiliar",
      "psicologo",
      "bibliotecario",
      "contador",
      "otro"
    ];

    return {
      success: true,
      data: cargos.map(cargo => ({
        value: cargo,
        label: cargo.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      })),
      error: null
    };
  } catch (error) {
    console.error("Error al obtener cargos:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener cargos"
    };
  }
}
