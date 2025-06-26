"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los permisos del sistema
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getPermisos() {
  try {
    const permisos = await db.permiso.findMany({
      orderBy: [
        { modulo: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return {
      success: true,
      data: permisos,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener permisos"
    };
  }
}

/**
 * Obtiene un permiso por su ID
 * @param {string} id - ID del permiso
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function getPermisoById(id) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del permiso"
      };
    }

    const permiso = await db.permiso.findUnique({
      where: {
        id: id
      }
    });

    if (!permiso) {
      return {
        success: false,
        data: null,
        error: "Permiso no encontrado"
      };
    }

    return {
      success: true,
      data: permiso,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener permiso:", error);
    return {
      success: false,
      data: null,
      error: "Error al obtener permiso"
    };
  }
}

/**
 * Crea un nuevo permiso
 * @param {Object} data - Datos del permiso
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function crearPermiso(data) {
  try {
    // Validar datos requeridos
    if (!data.codigo || !data.nombre || !data.modulo) {
      return {
        success: false,
        data: null,
        error: "Código, nombre y módulo son campos requeridos"
      };
    }

    // Verificar si el código ya está registrado
    const permisoExistente = await db.permiso.findUnique({
      where: { codigo: data.codigo }
    });

    if (permisoExistente) {
      return {
        success: false,
        data: null,
        error: "El código de permiso ya está registrado"
      };
    }

    // Crear el permiso
    const nuevoPermiso = await db.permiso.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        modulo: data.modulo,
        activo: data.activo !== undefined ? data.activo : true
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: nuevoPermiso,
      error: null
    };
  } catch (error) {
    console.error("Error al crear permiso:", error);
    return {
      success: false,
      data: null,
      error: "Error al crear permiso"
    };
  }
}

/**
 * Actualiza un permiso existente
 * @param {string} id - ID del permiso
 * @param {Object} data - Datos actualizados del permiso
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function actualizarPermiso(id, data) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del permiso"
      };
    }

    // Verificar si el permiso existe
    const permisoExistente = await db.permiso.findUnique({
      where: { id }
    });

    if (!permisoExistente) {
      return {
        success: false,
        data: null,
        error: "Permiso no encontrado"
      };
    }

    // Verificar si el código ya está registrado por otro permiso
    if (data.codigo && data.codigo !== permisoExistente.codigo) {
      const codigoExistente = await db.permiso.findUnique({
        where: { codigo: data.codigo }
      });

      if (codigoExistente) {
        return {
          success: false,
          data: null,
          error: "El código de permiso ya está registrado por otro permiso"
        };
      }
    }

    // Actualizar el permiso
    const permisoActualizado = await db.permiso.update({
      where: { id },
      data: {
        ...(data.codigo && { codigo: data.codigo }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.modulo && { modulo: data.modulo }),
        ...(data.activo !== undefined && { activo: data.activo })
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: permisoActualizado,
      error: null
    };
  } catch (error) {
    console.error("Error al actualizar permiso:", error);
    return {
      success: false,
      data: null,
      error: "Error al actualizar permiso"
    };
  }
}

/**
 * Elimina un permiso
 * @param {string} id - ID del permiso
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function eliminarPermiso(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Se requiere el ID del permiso"
      };
    }

    // Verificar si el permiso existe
    const permisoExistente = await db.permiso.findUnique({
      where: { id }
    });

    if (!permisoExistente) {
      return {
        success: false,
        error: "Permiso no encontrado"
      };
    }

    // Verificar si el permiso está siendo utilizado por roles o usuarios
    const rolesConPermiso = await db.rolPermiso.findFirst({
      where: { permisoId: id }
    });

    if (rolesConPermiso) {
      return {
        success: false,
        error: "No se puede eliminar el permiso porque está asignado a uno o más roles"
      };
    }

    const usuariosConPermiso = await db.usuarioPermiso.findFirst({
      where: { permisoId: id }
    });

    if (usuariosConPermiso) {
      return {
        success: false,
        error: "No se puede eliminar el permiso porque está asignado a uno o más usuarios"
      };
    }

    // Eliminar el permiso
    await db.permiso.delete({
      where: { id }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error al eliminar permiso:", error);
    return {
      success: false,
      error: "Error al eliminar permiso"
    };
  }
}

/**
 * Obtiene los permisos asignados a un rol
 * @param {string} rol - Rol a consultar
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getPermisosRol(rol) {
  try {
    if (!rol) {
      return {
        success: false,
        data: [],
        error: "Se requiere el rol"
      };
    }

    const permisosRol = await db.rolPermiso.findMany({
      where: { rol },
      include: {
        permiso: true
      }
    });

    return {
      success: true,
      data: permisosRol.map(rp => rp.permiso),
      error: null
    };
  } catch (error) {
    console.error("Error al obtener permisos del rol:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener permisos del rol"
    };
  }
}

/**
 * Asigna un permiso a un rol
 * @param {string} rol - Rol
 * @param {string} permisoId - ID del permiso
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function asignarPermisoRol(rol, permisoId) {
  try {
    if (!rol || !permisoId) {
      return {
        success: false,
        data: null,
        error: "Se requiere el rol y el ID del permiso"
      };
    }

    // Verificar si el permiso existe
    const permisoExistente = await db.permiso.findUnique({
      where: { id: permisoId }
    });

    if (!permisoExistente) {
      return {
        success: false,
        data: null,
        error: "Permiso no encontrado"
      };
    }

    // Verificar si ya está asignado
    const asignacionExistente = await db.rolPermiso.findFirst({
      where: {
        rol,
        permisoId
      }
    });

    if (asignacionExistente) {
      return {
        success: false,
        data: null,
        error: "El permiso ya está asignado a este rol"
      };
    }

    // Crear la asignación
    const nuevaAsignacion = await db.rolPermiso.create({
      data: {
        rol,
        permisoId
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: nuevaAsignacion,
      error: null
    };
  } catch (error) {
    console.error("Error al asignar permiso al rol:", error);
    return {
      success: false,
      data: null,
      error: "Error al asignar permiso al rol"
    };
  }
}

/**
 * Revoca un permiso de un rol
 * @param {string} rol - Rol
 * @param {string} permisoId - ID del permiso
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function revocarPermisoRol(rol, permisoId) {
  try {
    if (!rol || !permisoId) {
      return {
        success: false,
        error: "Se requiere el rol y el ID del permiso"
      };
    }

    // Verificar si existe la asignación
    const asignacion = await db.rolPermiso.findFirst({
      where: {
        rol,
        permisoId
      }
    });

    if (!asignacion) {
      return {
        success: false,
        error: "El permiso no está asignado a este rol"
      };
    }

    // Eliminar la asignación
    await db.rolPermiso.delete({
      where: {
        id: asignacion.id
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error al revocar permiso del rol:", error);
    return {
      success: false,
      error: "Error al revocar permiso del rol"
    };
  }
}

/**
 * Obtiene los permisos asignados a un usuario
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getPermisosUsuario(usuarioId) {
  try {
    if (!usuarioId) {
      return {
        success: false,
        data: [],
        error: "Se requiere el ID del usuario"
      };
    }

    const permisosUsuario = await db.usuarioPermiso.findMany({
      where: { 
        usuarioId,
        activo: true,
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: new Date() } }
        ]
      },
      include: {
        permiso: true
      }
    });

    return {
      success: true,
      data: permisosUsuario.map(up => ({
        ...up.permiso,
        fechaInicio: up.fechaInicio,
        fechaFin: up.fechaFin,
        usuarioPermisoId: up.id
      })),
      error: null
    };
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener permisos del usuario"
    };
  }
}

/**
 * Asigna un permiso a un usuario
 * @param {string} usuarioId - ID del usuario
 * @param {string} permisoId - ID del permiso
 * @param {Object} options - Opciones adicionales (fechaInicio, fechaFin)
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function asignarPermisoUsuario(usuarioId, permisoId, options = {}) {
  try {
    if (!usuarioId || !permisoId) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del usuario y el ID del permiso"
      };
    }

    // Verificar si el usuario existe
    const usuarioExistente = await db.user.findUnique({
      where: { id: usuarioId }
    });

    if (!usuarioExistente) {
      return {
        success: false,
        data: null,
        error: "Usuario no encontrado"
      };
    }

    // Verificar si el permiso existe
    const permisoExistente = await db.permiso.findUnique({
      where: { id: permisoId }
    });

    if (!permisoExistente) {
      return {
        success: false,
        data: null,
        error: "Permiso no encontrado"
      };
    }

    // Verificar si ya está asignado y activo
    const asignacionExistente = await db.usuarioPermiso.findFirst({
      where: {
        usuarioId,
        permisoId,
        activo: true,
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: new Date() } }
        ]
      }
    });

    if (asignacionExistente) {
      return {
        success: false,
        data: null,
        error: "El permiso ya está asignado a este usuario"
      };
    }

    // Crear la asignación
    const fechaInicio = options.fechaInicio ? new Date(options.fechaInicio) : new Date();
    const fechaFin = options.fechaFin ? new Date(options.fechaFin) : null;

    const nuevaAsignacion = await db.usuarioPermiso.create({
      data: {
        usuarioId,
        permisoId,
        fechaInicio,
        fechaFin,
        activo: true
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: nuevaAsignacion,
      error: null
    };
  } catch (error) {
    console.error("Error al asignar permiso al usuario:", error);
    return {
      success: false,
      data: null,
      error: "Error al asignar permiso al usuario"
    };
  }
}

/**
 * Revoca un permiso de un usuario
 * @param {string} usuarioPermisoId - ID de la relación usuario-permiso
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function revocarPermisoUsuario(usuarioPermisoId) {
  try {
    if (!usuarioPermisoId) {
      return {
        success: false,
        error: "Se requiere el ID de la asignación"
      };
    }

    // Verificar si existe la asignación
    const asignacion = await db.usuarioPermiso.findUnique({
      where: {
        id: usuarioPermisoId
      }
    });

    if (!asignacion) {
      return {
        success: false,
        error: "Asignación no encontrada"
      };
    }

    // Actualizar la asignación (desactivar en lugar de eliminar)
    await db.usuarioPermiso.update({
      where: {
        id: usuarioPermisoId
      },
      data: {
        activo: false,
        fechaFin: new Date()
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error al revocar permiso del usuario:", error);
    return {
      success: false,
      error: "Error al revocar permiso del usuario"
    };
  }
}
