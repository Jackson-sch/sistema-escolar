"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los períodos académicos de una institución
 * @param {string} institucionId - ID de la institución
 * @returns {Promise<{success: boolean, data: Array, error: string|null}>}
 */
export async function getPeriodos(institucionId) {
  try {
    if (!institucionId) {
      return {
        success: false,
        data: [],
        error: "Se requiere el ID de la institución"
      };
    }

    const periodos = await db.periodoAcademico.findMany({
      where: {
        institucionId: institucionId
      },
      orderBy: [
        { anioEscolar: 'desc' },
        { numero: 'asc' }
      ]
    });

    return {
      success: true,
      data: periodos,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener períodos académicos:", error);
    return {
      success: false,
      data: [],
      error: "Error al obtener períodos académicos"
    };
  }
}

/**
 * Obtiene un período académico por su ID
 * @param {string} id - ID del período académico
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function getPeriodoById(id) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del período académico"
      };
    }

    const periodo = await db.periodoAcademico.findUnique({
      where: {
        id: id
      }
    });

    if (!periodo) {
      return {
        success: false,
        data: null,
        error: "Período académico no encontrado"
      };
    }

    return {
      success: true,
      data: periodo,
      error: null
    };
  } catch (error) {
    console.error("Error al obtener período académico:", error);
    return {
      success: false,
      data: null,
      error: "Error al obtener período académico"
    };
  }
}

/**
 * Crea un nuevo período académico
 * @param {Object} data - Datos del período académico
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function crearPeriodo(data) {
  try {
    // Validar datos requeridos
    if (!data.nombre || !data.tipo || !data.numero || !data.fechaInicio || 
        !data.fechaFin || !data.anioEscolar || !data.institucionId) {
      return {
        success: false,
        data: null,
        error: "Todos los campos son requeridos"
      };
    }

    // Validar que el tipo sea válido
    const tiposValidos = ["BIMESTRE", "TRIMESTRE", "SEMESTRE", "ANUAL"];
    if (!tiposValidos.includes(data.tipo)) {
      return {
        success: false,
        data: null,
        error: "El tipo de período no es válido"
      };
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (new Date(data.fechaInicio) >= new Date(data.fechaFin)) {
      return {
        success: false,
        data: null,
        error: "La fecha de inicio debe ser anterior a la fecha de fin"
      };
    }

    // Crear el período académico
    const nuevoPeriodo = await db.periodoAcademico.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        numero: parseInt(data.numero),
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        anioEscolar: parseInt(data.anioEscolar),
        activo: data.activo || true,
        institucionId: data.institucionId
      }
    });

    revalidatePath("/config/periodos-calendario");

    return {
      success: true,
      data: nuevoPeriodo,
      error: null
    };
  } catch (error) {
    console.error("Error al crear período académico:", error);
    
    // Manejar error de clave única
    if (error.code === 'P2002') {
      return {
        success: false,
        data: null,
        error: "Ya existe un período con el mismo tipo, número y año escolar para esta institución"
      };
    }
    
    return {
      success: false,
      data: null,
      error: "Error al crear período académico"
    };
  }
}

/**
 * Actualiza un período académico existente
 * @param {string} id - ID del período académico
 * @param {Object} data - Datos actualizados del período académico
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function actualizarPeriodo(id, data) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del período académico"
      };
    }

    // Validar que el período exista
    const periodoExistente = await db.periodoAcademico.findUnique({
      where: { id }
    });

    if (!periodoExistente) {
      return {
        success: false,
        data: null,
        error: "Período académico no encontrado"
      };
    }

    // Validar fechas si se están actualizando
    if (data.fechaInicio && data.fechaFin && 
        new Date(data.fechaInicio) >= new Date(data.fechaFin)) {
      return {
        success: false,
        data: null,
        error: "La fecha de inicio debe ser anterior a la fecha de fin"
      };
    }

    // Actualizar el período académico
    const periodoActualizado = await db.periodoAcademico.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.numero && { numero: parseInt(data.numero) }),
        ...(data.fechaInicio && { fechaInicio: new Date(data.fechaInicio) }),
        ...(data.fechaFin && { fechaFin: new Date(data.fechaFin) }),
        ...(data.anioEscolar && { anioEscolar: parseInt(data.anioEscolar) }),
        ...(data.activo !== undefined && { activo: data.activo })
      }
    });

    revalidatePath("/config/periodos-calendario");

    return {
      success: true,
      data: periodoActualizado,
      error: null
    };
  } catch (error) {
    console.error("Error al actualizar período académico:", error);
    
    // Manejar error de clave única
    if (error.code === 'P2002') {
      return {
        success: false,
        data: null,
        error: "Ya existe un período con el mismo tipo, número y año escolar para esta institución"
      };
    }
    
    return {
      success: false,
      data: null,
      error: "Error al actualizar período académico"
    };
  }
}

/**
 * Elimina un período académico
 * @param {string} id - ID del período académico
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function eliminarPeriodo(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Se requiere el ID del período académico"
      };
    }

    // Verificar si el período tiene evaluaciones asociadas
    const periodoConEvaluaciones = await db.periodoAcademico.findFirst({
      where: {
        id,
        evaluaciones: {
          some: {}
        }
      }
    });

    if (periodoConEvaluaciones) {
      return {
        success: false,
        error: "No se puede eliminar el período porque tiene evaluaciones asociadas"
      };
    }

    // Eliminar el período académico
    await db.periodoAcademico.delete({
      where: { id }
    });

    revalidatePath("/config/periodos-calendario");

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error al eliminar período académico:", error);
    return {
      success: false,
      error: "Error al eliminar período académico"
    };
  }
}

/**
 * Activa o desactiva un período académico
 * @param {string} id - ID del período académico
 * @param {boolean} activo - Estado activo/inactivo
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function cambiarEstadoPeriodo(id, activo) {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        error: "Se requiere el ID del período académico"
      };
    }

    const periodoActualizado = await db.periodoAcademico.update({
      where: { id },
      data: { activo }
    });

    revalidatePath("/config/periodos-calendario");

    return {
      success: true,
      data: periodoActualizado,
      error: null
    };
  } catch (error) {
    console.error("Error al cambiar estado del período académico:", error);
    return {
      success: false,
      data: null,
      error: "Error al cambiar estado del período académico"
    };
  }
}
