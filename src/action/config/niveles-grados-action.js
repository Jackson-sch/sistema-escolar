"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los niveles de una institución
 * @param {string} institucionId - ID de la institución
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getNiveles(institucionId) {
  try {
    const niveles = await db.nivel.findMany({
      where: {
        institucionId,
        activo: true
      },
      orderBy: { nombre: 'asc' },
      include: {
        grados: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        },
        _count: {
          select: {
            grados: true,
            nivelesAcademicos: true,
            anuncios: true,
            eventos: true
          }
        }
      }
    });

    return { success: true, data: niveles };
  } catch (error) {
    console.error("Error al obtener niveles:", error);
    return { success: false, error: "Error al cargar los niveles" };
  }
}

/**
 * Crea un nuevo nivel
 * @param {Object} data - Datos del nivel
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createNivel(data) {
  try {
    // Verificar si ya existe un nivel con el mismo nombre en la institución
    const existingNivel = await db.nivel.findFirst({
      where: {
        nombre: data.nombre,
        institucionId: data.institucionId,
        activo: true
      }
    });

    if (existingNivel) {
      return {
        success: false,
        error: `Ya existe un nivel con el nombre "${data.nombre}" en esta institución`
      };
    }

    const nivel = await db.nivel.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        institucion: {
          connect: { id: data.institucionId }
        }
      }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: nivel };
  } catch (error) {
    console.error("Error al crear nivel:", error);
    return { success: false, error: "Error al crear el nivel" };
  }
}

/**
 * Actualiza un nivel existente
 * @param {string} id - ID del nivel
 * @param {Object} data - Datos actualizados
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateNivel(id, data) {
  try {
    // Verificar si ya existe otro nivel con el mismo nombre en la institución
    if (data.nombre) {
      const existingNivel = await db.nivel.findFirst({
        where: {
          nombre: data.nombre,
          institucionId: data.institucionId,
          activo: true,
          NOT: { id }
        }
      });

      if (existingNivel) {
        return {
          success: false,
          error: `Ya existe otro nivel con el nombre "${data.nombre}" en esta institución`
        };
      }
    }

    const nivel = await db.nivel.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo
      }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: nivel };
  } catch (error) {
    console.error("Error al actualizar nivel:", error);
    return { success: false, error: "Error al actualizar el nivel" };
  }
}

/**
 * Elimina un nivel (desactivación lógica)
 * @param {string} id - ID del nivel
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteNivel(id) {
  try {
    // Verificar si hay grados, niveles académicos o áreas curriculares asociadas
    const nivel = await db.nivel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            grados: true,
            nivelesAcademicos: true,
            anuncios: true,
            eventos: true
          }
        }
      }
    });

    if (!nivel) {
      return { success: false, error: "Nivel no encontrado" };
    }

    const tieneElementosAsociados =
      nivel._count.grados > 0 ||
      nivel._count.nivelesAcademicos > 0 ||
      nivel._count.anuncios > 0 ||
      nivel._count.eventos > 0;

    if (tieneElementosAsociados) {
      // Desactivación lógica en lugar de eliminación física
      await db.nivel.update({
        where: { id },
        data: { activo: false }
      });

      revalidatePath("/config/estructura-academica");
      return {
        success: true,
        message: "El nivel ha sido desactivado porque tiene elementos asociados"
      };
    }

    // Si no tiene elementos asociados, eliminación física
    await db.nivel.delete({
      where: { id }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar nivel:", error);
    return { success: false, error: "Error al eliminar el nivel" };
  }
}

/**
 * Obtiene todos los grados de un nivel
 * @param {string} nivelId - ID del nivel
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getGrados(nivelId) {
  try {
    const grados = await db.grado.findMany({
      where: {
        nivelId,
        activo: true
      },
      orderBy: { orden: 'asc' },
      include: {
        nivel: true,
        _count: {
          select: {
            nivelesAcademicos: true,
            cursos: true
          }
        }
      }
    });

    return { success: true, data: grados };
  } catch (error) {
    console.error("Error al obtener grados:", error);
    return { success: false, error: "Error al cargar los grados" };
  }
}

/**
 * Crea un nuevo grado
 * @param {Object} data - Datos del grado
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createGrado(data) {
  try {
    // Verificar si ya existe un grado con el mismo nombre en el nivel
    const existingGrado = await db.grado.findFirst({
      where: {
        nombre: data.nombre,
        nivelId: data.nivelId,
        activo: true
      }
    });

    if (existingGrado) {
      return {
        success: false,
        error: `Ya existe un grado con el nombre "${data.nombre}" en este nivel`
      };
    }

    // Verificar si ya existe un grado con el mismo código
    if (data.codigo) {
      const existingCodigo = await db.grado.findFirst({
        where: {
          codigo: data.codigo,
          nivelId: data.nivelId,
          activo: true
        }
      });

      if (existingCodigo) {
        return {
          success: false,
          error: `Ya existe un grado con el código "${data.codigo}" en este nivel`
        };
      }
    }

    const grado = await db.grado.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion,
        orden: data.orden,
        nivel: {
          connect: { id: data.nivelId }
        }
      }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: grado };
  } catch (error) {
    console.error("Error al crear grado:", error);
    return { success: false, error: "Error al crear el grado" };
  }
}

/**
 * Actualiza un grado existente
 * @param {string} id - ID del grado
 * @param {Object} data - Datos actualizados
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateGrado(id, data) {
  try {
    // Verificar si ya existe otro grado con el mismo nombre en el nivel
    if (data.nombre) {
      const existingGrado = await db.grado.findFirst({
        where: {
          nombre: data.nombre,
          nivelId: data.nivelId,
          activo: true,
          NOT: { id }
        }
      });

      if (existingGrado) {
        return {
          success: false,
          error: `Ya existe otro grado con el nombre "${data.nombre}" en este nivel`
        };
      }
    }

    // Verificar si ya existe otro grado con el mismo código
    if (data.codigo) {
      const existingCodigo = await db.grado.findFirst({
        where: {
          codigo: data.codigo,
          nivelId: data.nivelId,
          activo: true,
          NOT: { id }
        }
      });

      if (existingCodigo) {
        return {
          success: false,
          error: `Ya existe otro grado con el código "${data.codigo}" en este nivel`
        };
      }
    }

    const grado = await db.grado.update({
      where: { id },
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion,
        orden: data.orden,
        activo: data.activo
      }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: grado };
  } catch (error) {
    console.error("Error al actualizar grado:", error);
    return { success: false, error: "Error al actualizar el grado" };
  }
}

/**
 * Elimina un grado (desactivación lógica)
 * @param {string} id - ID del grado
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteGrado(id) {
  try {
    // Verificar si hay niveles académicos o cursos asociados
    const grado = await db.grado.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            nivelesAcademicos: true,
            cursos: true
          }
        }
      }
    });

    if (!grado) {
      return { success: false, error: "Grado no encontrado" };
    }

    const tieneElementosAsociados =
      grado._count.nivelesAcademicos > 0 ||
      grado._count.cursos > 0;

    if (tieneElementosAsociados) {
      // Desactivación lógica en lugar de eliminación física
      await db.grado.update({
        where: { id },
        data: { activo: false }
      });

      revalidatePath("/config/estructura-academica");
      return {
        success: true,
        message: "El grado ha sido desactivado porque tiene elementos asociados"
      };
    }

    // Si no tiene elementos asociados, eliminación física
    await db.grado.delete({
      where: { id }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar grado:", error);
    return { success: false, error: "Error al eliminar el grado" };
  }
}
