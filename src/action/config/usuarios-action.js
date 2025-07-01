"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

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

    // Validar rol
    const rolSchema = z.enum(["ADMIN", "DIRECTOR", "PROFESOR", "ESTUDIANTE", "PADRE", "SECRETARIA", "TESORERO"]);
    try {
      rolSchema.parse(rol);
    } catch (error) {
      return { success: false, error: "Rol inválido" };
    }

    // Buscar usuarios con el rol especificado
    const usuarios = await prisma.user.findMany({
      where: {
        institucionId,
        role: rol,
        estado: "ACTIVO", // Solo usuarios activos
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
 * Obtiene los usuarios de una institución, excluyendo roles específicos
 * @param {string} institucionId - ID de la institución
 * @param {boolean} soloUsuariosSistema - Si es true, excluye estudiantes y padres
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getUsuarios(institucionId, soloUsuariosSistema = false) {
  try {
    if (!institucionId) {
      return {
        success: false,
        data: [],
        error: "Se requiere el ID de la institución"
      };
    }

    // Configurar filtro para excluir roles si es necesario
    const whereClause = {
      institucionId: institucionId
    };
    
    // Si soloUsuariosSistema es true, excluir estudiantes y padres
    if (soloUsuariosSistema) {
      whereClause.NOT = {
        role: { in: ["estudiante", "padre"] }
      };
    }

    const usuarios = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        estado: true,
        image: true,
        cargo: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { role: 'asc' },
        { apellidoPaterno: 'asc' }
      ]
    });

    return {
      success: true,
      data: usuarios,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener usuarios"
    };
  }
}

/**
 * Obtiene un usuario por su ID
 * @param {string} id - ID del usuario
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function getUsuarioById(id) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del usuario"
      };
    }

    const usuario = await db.user.findUnique({
      where: {
        id: id
      },
      include: {
        institucion: {
          select: {
            id: true,
            nombreInstitucion: true
          }
        }
      }
    });

    if (!usuario) {
      return {
        success: false,
        data: null,
        error: "Usuario no encontrado"
      };
    }

    return {
      success: true,
      data: usuario,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return {
      success: false,
      data: null,
      error: "Error al obtener usuario"
    };
  }
}

/**
 * Crea un nuevo usuario
 * @param {Object} data - Datos del usuario
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function crearUsuario(data) {
  try {
    // Validar datos requeridos
    if (!data.name || !data.email || !data.password || !data.role || !data.institucionId) {
      return {
        success: false,
        data: null,
        error: "Nombre, email, contraseña, rol e institución son campos requeridos"
      };
    }

    // Verificar si el email ya está registrado
    const usuarioExistente = await db.user.findUnique({
      where: { email: data.email }
    });

    if (usuarioExistente) {
      return {
        success: false,
        data: null,
        error: "El email ya está registrado"
      };
    }

    // Verificar si el DNI ya está registrado (si se proporciona)
    if (data.dni) {
      const dniExistente = await db.user.findUnique({
        where: { dni: data.dni }
      });

      if (dniExistente) {
        return {
          success: false,
          data: null,
          error: "El DNI ya está registrado"
        };
      }
    }

    // Hashear la contraseña
    const hashedPassword = await hash(data.password, 10);

    // Crear el usuario
    const nuevoUsuario = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        apellidoPaterno: data.apellidoPaterno || "",
        apellidoMaterno: data.apellidoMaterno || "",
        dni: data.dni || null,
        estado: data.estado || "activo",
        cargo: data.cargo || null,
        institucionId: data.institucionId
      }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: nuevoUsuario,
      error: null
    };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return {
      success: false,
      data: null,
      error: "Error al crear usuario"
    };
  }
}

/**
 * Actualiza un usuario existente
 * @param {string} id - ID del usuario
 * @param {Object} data - Datos actualizados del usuario
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function actualizarUsuario(id, data) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del usuario"
      };
    }

    // Verificar si el usuario existe
    const usuarioExistente = await db.user.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return {
        success: false,
        data: null,
        error: "Usuario no encontrado"
      };
    }

    // Verificar si el email ya está registrado por otro usuario
    if (data.email && data.email !== usuarioExistente.email) {
      const emailExistente = await db.user.findUnique({
        where: { email: data.email }
      });

      if (emailExistente) {
        return {
          success: false,
          data: null,
          error: "El email ya está registrado por otro usuario"
        };
      }
    }

    // Verificar si el DNI ya está registrado por otro usuario
    if (data.dni && data.dni !== usuarioExistente.dni) {
      const dniExistente = await db.user.findUnique({
        where: { dni: data.dni }
      });

      if (dniExistente) {
        return {
          success: false,
          data: null,
          error: "El DNI ya está registrado por otro usuario"
        };
      }
    }

    // Preparar los datos para actualizar
    const updateData = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role }),
      ...(data.apellidoPaterno && { apellidoPaterno: data.apellidoPaterno }),
      ...(data.apellidoMaterno && { apellidoMaterno: data.apellidoMaterno }),
      ...(data.dni && { dni: data.dni }),
      ...(data.estado && { estado: data.estado }),
      ...(data.cargo && { cargo: data.cargo })
    };

    // Si hay una nueva contraseña, hashearla
    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    // Actualizar el usuario
    const usuarioActualizado = await db.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: usuarioActualizado,
      error: null
    };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return {
      success: false,
      data: null,
      error: "Error al actualizar usuario"
    };
  }
}

/**
 * Elimina un usuario
 * @param {string} id - ID del usuario
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function eliminarUsuario(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Se requiere el ID del usuario"
      };
    }

    // Verificar si el usuario existe
    const usuarioExistente = await db.user.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return {
        success: false,
        error: "Usuario no encontrado"
      };
    }

    // Verificar si el usuario es un director de institución
    const esDirector = await db.institucionEducativa.findFirst({
      where: {
        directorId: id
      }
    });

    if (esDirector) {
      return {
        success: false,
        error: "No se puede eliminar el usuario porque es director de una institución"
      };
    }

    // Verificar otras relaciones importantes antes de eliminar
    // Aquí podrían agregarse más verificaciones según sea necesario

    // Eliminar el usuario
    await db.user.delete({
      where: { id }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return {
      success: false,
      error: "Error al eliminar usuario"
    };
  }
}

/**
 * Cambia el estado de un usuario
 * @param {string} id - ID del usuario
 * @param {string} estado - Nuevo estado del usuario
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function cambiarEstadoUsuario(id, estado) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del usuario"
      };
    }

    // Verificar si el estado es válido
    const estadosValidos = ["activo", "inactivo", "suspendido", "eliminado", "retirado", 
                            "egresado", "licencia", "vacaciones", "trasladado", "graduado", 
                            "condicional", "practicante", "jubilado", "expulsado"];
    
    if (!estadosValidos.includes(estado)) {
      return {
        success: false,
        data: null,
        error: "Estado no válido"
      };
    }

    const usuarioActualizado = await db.user.update({
      where: { id },
      data: { estado }
    });

    revalidatePath("/config/usuarios-permisos");

    return {
      success: true,
      data: usuarioActualizado,
      error: null
    };
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return {
      success: false,
      data: null,
      error: "Error al cambiar estado del usuario"
    };
  }
}
