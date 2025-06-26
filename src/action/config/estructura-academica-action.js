"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los niveles académicos de una institución
 * @param {string} institucionId - ID de la institución
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getNivelesAcademicos(institucionId) {
  try {
    // Primero obtenemos los datos sin ordenar para evitar conflictos
    const nivelesAcademicos = await db.nivelAcademico.findMany({
      where: {
        institucionId,
      },
      include: {
        nivel: true,
        grado: true,
        _count: {
          select: {
            students: true,
            cursos: true,
          }
        }
      }
    });

    console.log("Datos sin procesar:", nivelesAcademicos);

    // Ordenamos manualmente los resultados
    const nivelesOrdenados = [...nivelesAcademicos].sort((a, b) => {
      // Primero por nivel (usando el nombre del nivel)
      const nivelA = a.nivel?.nombre || '';
      const nivelB = b.nivel?.nombre || '';
      if (nivelA < nivelB) return -1;
      if (nivelA > nivelB) return 1;

      // Luego por grado (usando el nombre del grado)
      const gradoA = a.grado?.nombre || '';
      const gradoB = b.grado?.nombre || '';
      if (gradoA < gradoB) return -1;
      if (gradoA > gradoB) return 1;

      // Finalmente por sección
      const seccionA = a.seccion || '';
      const seccionB = b.seccion || '';
      if (seccionA < seccionB) return -1;
      if (seccionA > seccionB) return 1;

      return 0;
    });

    // Transformamos los datos para que sean compatibles con React
    const nivelesTransformados = nivelesOrdenados.map((nivel) => {
      console.log("Procesando nivel:", nivel);
      
      return {
        id: nivel.id,
        seccion: nivel.seccion,
        turno: nivel.turno,
        capacidadMaxima: nivel.capacidadMaxima,
        aulaAsignada: nivel.aulaAsignada,
        descripcion: nivel.descripcion,
        anioAcademico: nivel.anioAcademico,
        activo: nivel.activo,
        institucionId: nivel.institucionId,
        nivelId: nivel.nivelId,
        gradoId: nivel.gradoId,
        createdAt: nivel.createdAt,
        updatedAt: nivel.updatedAt,
        
        // Propiedades transformadas para mostrar
        gradoNombre: nivel.grado?.nombre || 'Sin grado',
        nivelNombre: nivel.nivel?.nombre || 'Sin nivel',
        
        // Objetos completos para edición (si los necesitas)
        nivelObj: nivel.nivel,
        gradoObj: nivel.grado,
        
        // Contadores
        estudiantesCount: nivel._count?.students || 0,
        cursosCount: nivel._count?.cursos || 0,
        
        // Para compatibilidad con código existente
        grado: nivel.grado?.nombre || 'Sin grado',
        nivel: nivel.nivel?.nombre || 'Sin nivel'
      };
    });

    console.log("Niveles transformados:", nivelesTransformados);
    
    return {
      success: true,
      data: nivelesTransformados
    };

  } catch (error) {
    console.error("Error al obtener niveles académicos:", error);
    return { 
      success: false, 
      error: "Error al cargar los niveles académicos",
      data: []
    };
  }
}

/**
 * Crea un nuevo nivel académico
 * @param {Object} data - Datos del nivel académico
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createNivelAcademico(data) {
  try {
    console.log('Datos recibidos para crear nivel académico:', data);
    
    // Verificar si ya existe un nivel académico con la misma combinación de nivelId, gradoId, sección y año académico
    const existingNivelAcademico = await db.nivelAcademico.findFirst({
      where: {
        institucionId: data.institucionId,
        nivelId: data.nivelId,
        gradoId: data.gradoId,
        seccion: data.seccion || '',
        anioAcademico: parseInt(data.anioAcademico),
      },
    });

    if (existingNivelAcademico) {
      return {
        success: false,
        error: `Ya existe un nivel académico con la misma combinación de nivel, grado, sección y año académico`
      };
    }

    // Preparar los datos para la creación
    const createData = {
      seccion: data.seccion || "",
      turno: data.turno,
      capacidadMaxima: data.capacidadMaxima ? parseInt(data.capacidadMaxima) : null,
      aulaAsignada: data.aulaAsignada || "",
      descripcion: data.descripcion || "",
      anioAcademico: parseInt(data.anioAcademico),
      activo: data.activo,
      institucion: {
        connect: { id: data.institucionId },
      },
      // Conectar directamente con nivel y grado usando sus IDs
      nivel: {
        connect: { id: data.nivelId }
      },
      grado: {
        connect: { id: data.gradoId }
      }
    };

    const nivelAcademico = await db.nivelAcademico.create({
      data: createData,
      include: {
        grado: true,
      }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: nivelAcademico };
  } catch (error) {
    console.error("Error al crear nivel académico:", error);
    return { success: false, error: "Error al crear el nivel académico" };
  }
}

/**
 * Actualiza un nivel académico existente
 * @param {string} id - ID del nivel académico
 * @param {Object} data - Datos actualizados
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateNivelAcademico(id, data) {
  try {
    console.log('Datos recibidos para actualizar nivel académico:', id, data);
    
    // Verificar si el nivel académico existe
    const existingNivelAcademico = await db.nivelAcademico.findUnique({
      where: { id },
    });

    if (!existingNivelAcademico) {
      return { success: false, error: "Nivel académico no encontrado" };
    }

    // Verificar si ya existe otro nivel académico con la misma combinación de nivelId, gradoId, sección y año académico
    const duplicateNivelAcademico = await db.nivelAcademico.findFirst({
      where: {
        institucionId: data.institucionId,
        nivelId: data.nivelId,
        gradoId: data.gradoId,
        seccion: data.seccion || '',
        anioAcademico: parseInt(data.anioAcademico),
        NOT: { id },
      },
    });

    if (duplicateNivelAcademico) {
      return {
        success: false,
        error: `Ya existe otro nivel académico con la misma combinación de nivel, grado, sección y año académico`
      };
    }

    // Preparar los datos para la actualización
    const updateData = {
      seccion: data.seccion || "",
      turno: data.turno,
      capacidadMaxima: data.capacidadMaxima ? parseInt(data.capacidadMaxima) : null,
      aulaAsignada: data.aulaAsignada || "",
      descripcion: data.descripcion || "",
      anioAcademico: parseInt(data.anioAcademico),
      activo: data.activo,
    };

    // Actualizar relaciones con Nivel y Grado
    if (data.nivelId) {
      updateData.nivel = {
        connect: { id: data.nivelId }
      };
    }

    if (data.gradoId) {
      updateData.grado = {
        connect: { id: data.gradoId }
      };
    }

    const nivelAcademico = await db.nivelAcademico.update({
      where: { id },
      data: updateData,
      include: {
        grado: true,
      }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: nivelAcademico };
  } catch (error) {
    console.error("Error al actualizar nivel académico:", error);
    return { success: false, error: "Error al actualizar el nivel académico" };
  }
}

/**
 * Elimina un nivel académico
 * @param {string} id - ID del nivel académico
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function deleteNivelAcademico(id) {
  try {
    // Verificar si hay estudiantes o cursos asociados
    const nivelAcademico = await db.nivelAcademico.findUnique({
      where: { id },
      include: {
        grado: true,
        _count: {
          select: {
            students: true,
            cursos: true,
            matriculas: true
          }
        }
      }
    });

    if (!nivelAcademico) {
      return { success: false, error: "Nivel académico no encontrado" };
    }

    // Verificar si hay relaciones que impidan la eliminación
    if (nivelAcademico._count.students > 0) {
      return {
        success: false,
        error: `No se puede eliminar el nivel académico ${nivelAcademico.nivel} ${nivelAcademico.grado} ${nivelAcademico.seccion} porque tiene ${nivelAcademico._count.students} estudiantes asignados`
      };
    }

    if (nivelAcademico._count.cursos > 0) {
      return {
        success: false,
        error: `No se puede eliminar el nivel académico ${nivelAcademico.nivel} ${nivelAcademico.grado} ${nivelAcademico.seccion} porque tiene ${nivelAcademico._count.cursos} cursos asignados`
      };
    }

    if (nivelAcademico._count.matriculas > 0) {
      return {
        success: false,
        error: `No se puede eliminar el nivel académico ${nivelAcademico.nivel} ${nivelAcademico.grado} ${nivelAcademico.seccion} porque tiene ${nivelAcademico._count.matriculas} matrículas asociadas`
      };
    }

    // Eliminar el nivel académico
    const eliminado = await db.nivelAcademico.delete({
      where: { id },
      include: {
        grado: true
      }
    });

    revalidatePath("/config/estructura-academica");
    return {
      success: true,
      data: eliminado,
      message: `Nivel académico ${eliminado.nivel} ${eliminado.grado} ${eliminado.seccion} eliminado correctamente`
    };
  } catch (error) {
    console.error("Error al eliminar nivel académico:", error);
    return { success: false, error: "Error al eliminar el nivel académico" };
  }
}

/**
 * Obtiene todas las áreas curriculares de una institución
 * @param {string} institucionId - ID de la institución
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getAreasCurriculares(institucionId) {
  try {
    // Obtener el año académico actual (puedes ajustar esto según tu lógica de negocio)
    const anioActual = new Date().getFullYear();
    
    const areasCurriculares = await db.areaCurricular.findMany({
      where: {
        institucionId,
        activa: true
      },
      include: {
        // Incluir los cursos relacionados con esta área curricular
        cursos: {
          include: {
            profesor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                email: true
              }
            }
          },
          where: {
            activo: true, // Solo cursos activos
            anioAcademico: anioActual // Año académico actual por defecto
          },
          orderBy: {
            nombre: 'asc' 
          }
        }
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ],
    });
    
    // Verificar que los cursos estén siendo incluidos correctamente
    console.log("Areas curriculares con cursos:", 
      areasCurriculares.map(area => ({
        id: area.id,
        nombre: area.nombre,
        cursosCount: area.cursos?.length || 0
      })));
    
    // Verificar el primer área curricular y sus cursos si existe
    if (areasCurriculares.length > 0) {
      console.log("Primera área curricular:", areasCurriculares[0].nombre);
      console.log("Cursos de la primera área:", areasCurriculares[0].cursos);
    }
    return { success: true, data: areasCurriculares };
  } catch (error) {
    console.error("Error al obtener áreas curriculares:", error);
    return { success: false, error: "Error al cargar las áreas curriculares: " + error.message };
  }
}

/**
 * Crea un área curricular
 * @param {Object} data - Datos del área curricular
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createAreaCurricular(data) {
  try {
    console.log("Creando área curricular con datos:", data);

    // Validación de campos requeridos
    if (!data.nombre || !data.codigo || !data.institucionId) {
      return {
        success: false,
        error: "Los campos nombre, código e institución son obligatorios"
      };
    }

    // Verificar que la institución existe
    const institucionExists = await db.institucionEducativa.findUnique({
      where: { id: data.institucionId }
    });

    if (!institucionExists) {
      return {
        success: false,
        error: "La institución especificada no existe"
      };
    }

    // Verificar si ya existe un área con el mismo código en la institución
    const existingArea = await db.AreaCurricular.findFirst({
      where: {
        codigo: data.codigo,
        institucionId: data.institucionId
      }
    });

    if (existingArea) {
      return {
        success: false,
        error: `Ya existe un área curricular con el código ${data.codigo}`
      };
    }

    // Validar nivel si se proporciona
    if (data.nivelId) {
      const nivelExists = await db.Nivel.findUnique({
        where: { id: data.nivelId }
      });

      if (!nivelExists) {
        return {
          success: false,
          error: "El nivel especificado no existe"
        };
      }
    }

    // Validar área padre si se proporciona
    if (data.parentId) {
      const parentExists = await db.AreaCurricular.findUnique({
        where: { id: data.parentId }
      });

      if (!parentExists) {
        return {
          success: false,
          error: "El área padre especificada no existe"
        };
      }

      // Verificar que el área padre pertenezca a la misma institución
      if (parentExists.institucionId !== data.institucionId) {
        return {
          success: false,
          error: "El área padre debe pertenecer a la misma institución"
        };
      }
    }

    // Preparar los datos para la creación
    const createData = {
      nombre: data.nombre.trim(),
      codigo: data.codigo.trim().toUpperCase(),
      descripcion: data.descripcion?.trim() || '',
      orden: data.orden || 0,
      color: data.color || '#3498db',
      competencias: data.competencias?.trim() || '',
      activa: data.activa !== undefined ? data.activa : true,
      institucionId: data.institucionId,
      // Asignar nivelId si se proporciona
      ...(data.nivelId ? { nivelId: data.nivelId } : {}),
      // Asignar parentId si se proporciona
      ...(data.parentId ? { parentId: data.parentId } : {})
    };

    const areaCurricular = await db.AreaCurricular.create({
      data: createData
    });

    console.log("Área curricular creada:", areaCurricular);
    revalidatePath("/config/estructura-academica");
    return { success: true, data: areaCurricular };
  } catch (error) {
    console.error("Error al crear área curricular:", error);

    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return { success: false, error: "Ya existe un área curricular con estos datos únicos" };
    }

    return { success: false, error: "Error al crear el área curricular: " + error.message };
  }
}

/**
 * Actualiza un área curricular existente
 * @param {string} id - ID del área curricular
 * @param {Object} data - Datos actualizados
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateAreaCurricular(id, data) {
  try {
    console.log("Actualizando área curricular:", id, data);

    // Validación básica
    if (!id) {
      return { success: false, error: "ID del área curricular es requerido" };
    }

    // Obtener el área actual
    const currentArea = await db.AreaCurricular.findUnique({
      where: { id },
      include: {
        subAreas: { select: { id: true } }
      }
    });

    if (!currentArea) {
      return { success: false, error: "Área curricular no encontrada" };
    }

    // Verificar duplicados de código si se está actualizando
    if (data.codigo && data.codigo !== currentArea.codigo) {
      const existingArea = await db.AreaCurricular.findFirst({
        where: {
          id: { not: id },
          codigo: data.codigo.trim().toUpperCase(),
          institucionId: currentArea.institucionId
        }
      });

      if (existingArea) {
        return {
          success: false,
          error: `Ya existe un área curricular con el código ${data.codigo}`
        };
      }
    }

    // Validar nivel si se proporciona
    if (data.nivelId) {
      const nivelExists = await db.Nivel.findUnique({
        where: { id: data.nivelId }
      });

      if (!nivelExists) {
        return {
          success: false,
          error: "El nivel especificado no existe"
        };
      }
    }

    // Validar área padre si se proporciona
    if (data.parentId) {
      // Verificar que no esté intentando conectarse a sí mismo como padre
      if (data.parentId === id) {
        return {
          success: false,
          error: "Un área curricular no puede ser su propio padre"
        };
      }

      // Verificar que no esté intentando conectarse a una de sus sub-áreas (evitar ciclos)
      const isSubArea = currentArea.subAreas.some(subArea => subArea.id === data.parentId);
      if (isSubArea) {
        return {
          success: false,
          error: "Un área curricular no puede tener como padre a una de sus sub-áreas"
        };
      }

      const parentExists = await db.AreaCurricular.findUnique({
        where: { id: data.parentId }
      });

      if (!parentExists) {
        return {
          success: false,
          error: "El área padre especificada no existe"
        };
      }

      // Verificar que el área padre pertenezca a la misma institución
      if (parentExists.institucionId !== currentArea.institucionId) {
        return {
          success: false,
          error: "El área padre debe pertenecer a la misma institución"
        };
      }
    }

    // Preparar los datos para la actualización
    const updateData = {
      ...data
    };

    // Limpiar y formatear datos de texto
    if (updateData.nombre) updateData.nombre = updateData.nombre.trim();
    if (updateData.codigo) updateData.codigo = updateData.codigo.trim().toUpperCase();
    if (updateData.descripcion !== undefined) updateData.descripcion = updateData.descripcion?.trim() || '';
    if (updateData.competencias !== undefined) updateData.competencias = updateData.competencias?.trim() || '';

    // Eliminar campos de relación directa para manejarlos con connect/disconnect
    delete updateData.nivel;
    delete updateData.parent;
    delete updateData.subAreas;
    delete updateData.institucion;

    // Manejar relaciones
    if (data.nivelId !== undefined) {
      updateData.nivelId = data.nivelId || null;
    }

    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId || null;
    }

    const areaCurricular = await db.AreaCurricular.update({
      where: { id },
      data: updateData
    });

    console.log("Área curricular actualizada con éxito:", areaCurricular.id);
    revalidatePath("/config/estructura-academica");
    return { success: true, data: areaCurricular };
  } catch (error) {
    console.error("Error al actualizar área curricular:", error);

    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return { success: false, error: "Ya existe un área curricular con estos datos únicos" };
    }

    if (error.code === 'P2025') {
      return { success: false, error: "Área curricular no encontrada" };
    }

    return { success: false, error: "Error al actualizar el área curricular: " + error.message };
  }
}

/**
 * Función auxiliar para verificar ciclos en la jerarquía
 * @param {string} areaId - ID del área a verificar
 * @param {string} potentialParentId - ID del potencial padre
 * @returns {Promise<boolean>} - true si crearía un ciclo
 */
async function wouldCreateCycle(areaId, potentialParentId) {
  if (!potentialParentId) return false;

  let currentParentId = potentialParentId;
  const visited = new Set();

  while (currentParentId && !visited.has(currentParentId)) {
    if (currentParentId === areaId) {
      return true; // Se encontró un ciclo
    }

    visited.add(currentParentId);

    const parent = await db.AreaCurricular.findUnique({
      where: { id: currentParentId },
      select: { parentId: true }
    });

    currentParentId = parent?.parentId;
  }

  return false;
}

/**
 * Elimina un área curricular (desactivación lógica)
 * @param {string} id - ID del área curricular
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteAreaCurricular(id) {
  try {
    console.log("Intentando eliminar área curricular con ID:", id);

    // Verificar si hay cursos o subáreas asociadas
    const areaCurricular = await db.AreaCurricular.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cursos: true,
            subAreas: true
          }
        }
      }
    });

    if (!areaCurricular) {
      return { success: false, error: "Área curricular no encontrada" };
    }

    // Si tiene cursos o subáreas, solo desactivamos
    if (areaCurricular._count.cursos > 0 || areaCurricular._count.subAreas > 0) {
      console.log(`El área tiene ${areaCurricular._count.cursos} cursos y ${areaCurricular._count.subAreas} subáreas. Desactivando en lugar de eliminar.`);

      // En lugar de eliminar, desactivamos el área
      await db.AreaCurricular.update({
        where: { id },
        data: { activa: false }
      });
    } else {
      console.log("No hay dependencias. Eliminando completamente el área curricular.");

      // Si no hay cursos ni subáreas, podemos eliminar completamente
      await db.AreaCurricular.delete({
        where: { id }
      });
    }

    revalidatePath("/config/estructura-academica");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar área curricular:", error);
    return { success: false, error: "Error al eliminar el área curricular: " + error.message };
  }
}

/**
 * Obtiene todos los cursos de una institución
 * @param {string} institucionId - ID de la institución
 * @param {Object} filters - Filtros opcionales (nivel, grado, etc.)
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getCursos(institucionId, filters = {}) {
  try {
    // Construir la consulta con filtros
    const whereClause = {
      areaCurricular: {
        institucionId
      },
      ...filters
    };

    const cursos = await db.curso.findMany({
      where: whereClause,
      include: {
        areaCurricular: true,
        // Para alcance SECCION_ESPECIFICA
        nivelAcademico: {
          include: {
            nivel: true,
            grado: true
          }
        },
        // Para alcance TODO_EL_GRADO
        grado: {
          include: {
            nivel: true
          }
        },
        // Para alcance TODO_EL_NIVEL
        nivel: true,
        profesor: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true
          }
        },
        _count: {
          select: {
            estudiantes: true,
            evaluaciones: true,
            horarios: true
          }
        }
      },
      orderBy: [
        { anioAcademico: 'desc' },
        { nombre: 'asc' }
      ]
    });
console.log("cursos desde el backend", cursos)
    return { success: true, data: cursos };
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return { success: false, error: "Error al cargar los cursos" };
  }
}

/**
 * Crea un nuevo curso
 * @param {Object} data - Datos del curso
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createCurso(data) {
  try {
    console.log("Datos recibidos en createCurso:", data);
    
    // Validar que el alcance sea válido
    const alcancesValidos = ['SECCION_ESPECIFICA', 'TODO_EL_GRADO', 'TODO_EL_NIVEL', 'TODO_LA_INSTITUCION'];
    if (!alcancesValidos.includes(data.alcance)) {
      return {
        success: false,
        error: 'El alcance del curso debe ser uno de: SECCION_ESPECIFICA, TODO_EL_GRADO, TODO_EL_NIVEL, TODO_LA_INSTITUCION'
      };
    }

    // Validar campos obligatorios básicos
    if (!data.areaCurricularId) {
      return { success: false, error: "El área curricular es obligatoria" };
    }

    if (!data.profesorId) {
      return { success: false, error: "El profesor es obligatorio" };
    }

    // Preparar datos según el alcance y validar campos requeridos
    const dataToSubmit = {
      nombre: data.nombre,
      codigo: data.codigo,
      descripcion: data.descripcion,
      anioAcademico: data.anioAcademico,
      horasSemanales: data.horasSemanales,
      creditos: data.creditos,
      alcance: data.alcance,
      areaCurricularId: data.areaCurricularId,
      profesorId: data.profesorId,
      activo: data.activo ?? true
    };

    // Configurar campos según el alcance
    switch (data.alcance) {
      case 'SECCION_ESPECIFICA':
        if (!data.nivelAcademicoId) {
          return { success: false, error: 'Para alcance de sección específica, el nivel académico es requerido' };
        }
        dataToSubmit.nivelAcademicoId = data.nivelAcademicoId;
        break;

      case 'TODO_EL_GRADO':
        if (!data.gradoId) {
          return { success: false, error: 'Para alcance de todo el grado, el grado es requerido' };
        }
        dataToSubmit.gradoId = data.gradoId;
        // Para este alcance, necesitamos un nivelAcademicoId de referencia
        // Buscar el primer nivel académico del grado seleccionado
        const nivelAcademicoGrado = await db.nivelAcademico.findFirst({
          where: { gradoId: data.gradoId, activo: true }
        });
        if (!nivelAcademicoGrado) {
          return { success: false, error: 'No se encontró un nivel académico activo para el grado seleccionado' };
        }
        dataToSubmit.nivelAcademicoId = nivelAcademicoGrado.id;
        break;

      case 'TODO_EL_NIVEL':
        if (!data.nivelId) {
          return { success: false, error: 'Para alcance de todo el nivel, el nivel es requerido' };
        }
        dataToSubmit.nivelId = data.nivelId;
        // Para este alcance, necesitamos un nivelAcademicoId de referencia
        // Buscar el primer nivel académico del nivel seleccionado
        const nivelAcademicoNivel = await db.nivelAcademico.findFirst({
          where: { nivelId: data.nivelId, activo: true }
        });
        if (!nivelAcademicoNivel) {
          return { success: false, error: 'No se encontró un nivel académico activo para el nivel seleccionado' };
        }
        dataToSubmit.nivelAcademicoId = nivelAcademicoNivel.id;
        break;

      case 'TODO_LA_INSTITUCION':
        if (!data.institucionId) {
          return { success: false, error: 'Para alcance de toda la institución, la institución es requerida' };
        }
        dataToSubmit.institucionId = data.institucionId;
        // Para este alcance, necesitamos un nivelAcademicoId de referencia
        // Buscar el primer nivel académico activo de la institución
        const nivelAcademicoInstitucion = await db.nivelAcademico.findFirst({
          where: { 
            nivel: {
              grado: {
                institucionId: data.institucionId
              }
            },
            activo: true 
          }
        });
        if (!nivelAcademicoInstitucion) {
          return { success: false, error: 'No se encontró un nivel académico activo para la institución seleccionada' };
        }
        dataToSubmit.nivelAcademicoId = nivelAcademicoInstitucion.id;
        break;
    }

    // Verificar unicidad según el alcance
    const whereCondition = {
      codigo: data.codigo,
      anioAcademico: data.anioAcademico
    };

    switch (data.alcance) {
      case 'SECCION_ESPECIFICA':
        whereCondition.nivelAcademicoId = dataToSubmit.nivelAcademicoId;
        break;
      case 'TODO_EL_GRADO':
        whereCondition.gradoId = dataToSubmit.gradoId;
        break;
      case 'TODO_EL_NIVEL':
        whereCondition.nivelId = dataToSubmit.nivelId;
        break;
      case 'TODO_LA_INSTITUCION':
        whereCondition.institucionId = dataToSubmit.institucionId;
        break;
    }

    const existingCurso = await db.curso.findFirst({
      where: whereCondition
    });

    if (existingCurso) {
      return {
        success: false,
        error: `Ya existe un curso con el código ${data.codigo} para este ${data.alcance.toLowerCase().replace('_', ' ')} y año académico`
      };
    }

    // Verificar que las relaciones existan
    await validateRelations(dataToSubmit);

    // Crear el curso
    const curso = await db.curso.create({
      data: dataToSubmit,
      include: {
        areaCurricular: true,
        profesor: { select: { id: true, name: true, apellidoPaterno: true, email: true } },
        nivelAcademico: {
          include: {
            nivel: true,
            grado: true
          }
        },
        grado: true,
        nivel: true,
        institucion: true
      }
    });

    console.log("Curso creado exitosamente:", curso.id);
    return { success: true, data: curso };

  } catch (error) {
    console.error("Error al crear curso:", error);

    // Manejar errores específicos de Prisma
    if (error.code === 'P2003') {
      return {
        success: false,
        error: `Error de relación: ${error.meta?.field_name || 'Un campo'} hace referencia a un registro que no existe`
      };
    } else if (error.code === 'P2002') {
      return {
        success: false,
        error: `Ya existe un curso con el mismo ${error.meta?.target?.join(', ') || 'identificador único'}`
      };
    }

    return { 
      success: false, 
      error: `Error al crear el curso: ${error.message || 'Error desconocido'}` 
    };
  }
}

/**
 * Actualiza un curso existente
 * @param {string} id - ID del curso
 * @param {Object} data - Datos actualizados
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateCurso(id, data) {
  try {
    // Obtener el curso actual
    const currentCurso = await db.curso.findUnique({
      where: { id },
      include: {
        areaCurricular: true,
        profesor: true,
        nivelAcademico: true,
        grado: true,
        nivel: true,
        institucion: true
      }
    });

    if (!currentCurso) {
      return { success: false, error: "Curso no encontrado" };
    }

    // Preparar datos para actualización
    const dataToSubmit = { ...data };

    // Si se está cambiando el alcance, validar y ajustar campos
    if (data.alcance && data.alcance !== currentCurso.alcance) {
      // Limpiar campos que no aplican al nuevo alcance
      switch (data.alcance) {
        case 'SECCION_ESPECIFICA':
          if (!data.nivelAcademicoId) {
            return { success: false, error: 'Para alcance de sección específica, el nivel académico es requerido' };
          }
          dataToSubmit.gradoId = null;
          dataToSubmit.nivelId = null;
          dataToSubmit.institucionId = null;
          break;

        case 'TODO_EL_GRADO':
          if (!data.gradoId) {
            return { success: false, error: 'Para alcance de todo el grado, el grado es requerido' };
          }
          // Buscar un nivelAcademicoId de referencia para el grado
          const nivelAcademicoGrado = await db.nivelAcademico.findFirst({
            where: { gradoId: data.gradoId, activo: true }
          });
          if (!nivelAcademicoGrado) {
            return { success: false, error: 'No se encontró un nivel académico activo para el grado seleccionado' };
          }
          dataToSubmit.nivelAcademicoId = nivelAcademicoGrado.id;
          dataToSubmit.nivelId = null;
          dataToSubmit.institucionId = null;
          break;

        case 'TODO_EL_NIVEL':
          if (!data.nivelId) {
            return { success: false, error: 'Para alcance de todo el nivel, el nivel es requerido' };
          }
          // Buscar un nivelAcademicoId de referencia para el nivel
          const nivelAcademicoNivel = await db.nivelAcademico.findFirst({
            where: { nivelId: data.nivelId, activo: true }
          });
          if (!nivelAcademicoNivel) {
            return { success: false, error: 'No se encontró un nivel académico activo para el nivel seleccionado' };
          }
          dataToSubmit.nivelAcademicoId = nivelAcademicoNivel.id;
          dataToSubmit.gradoId = null;
          dataToSubmit.institucionId = null;
          break;

        case 'TODO_LA_INSTITUCION':
          if (!data.institucionId) {
            return { success: false, error: 'Para alcance de toda la institución, la institución es requerida' };
          }
          // Buscar un nivelAcademicoId de referencia para la institución
          const nivelAcademicoInstitucion = await db.nivelAcademico.findFirst({
            where: { 
              nivel: {
                grado: {
                  institucionId: data.institucionId
                }
              },
              activo: true 
            }
          });
          if (!nivelAcademicoInstitucion) {
            return { success: false, error: 'No se encontró un nivel académico activo para la institución seleccionada' };
          }
          dataToSubmit.nivelAcademicoId = nivelAcademicoInstitucion.id;
          dataToSubmit.gradoId = null;
          dataToSubmit.nivelId = null;
          break;
      }
    }

    // Verificar unicidad si se están cambiando campos relevantes
    if (data.codigo || data.anioAcademico || data.alcance || data.nivelAcademicoId || data.gradoId || data.nivelId || data.institucionId) {
      const alcanceToCheck = data.alcance || currentCurso.alcance;
      const whereCondition = {
        id: { not: id },
        codigo: data.codigo || currentCurso.codigo,
        anioAcademico: data.anioAcademico || currentCurso.anioAcademico
      };

      switch (alcanceToCheck) {
        case 'SECCION_ESPECIFICA':
          whereCondition.nivelAcademicoId = dataToSubmit.nivelAcademicoId || currentCurso.nivelAcademicoId;
          break;
        case 'TODO_EL_GRADO':
          whereCondition.gradoId = dataToSubmit.gradoId || currentCurso.gradoId;
          break;
        case 'TODO_EL_NIVEL':
          whereCondition.nivelId = dataToSubmit.nivelId || currentCurso.nivelId;
          break;
        case 'TODO_LA_INSTITUCION':
          whereCondition.institucionId = dataToSubmit.institucionId || currentCurso.institucionId;
          break;
      }

      const existingCurso = await db.curso.findFirst({ where: whereCondition });

      if (existingCurso) {
        return {
          success: false,
          error: `Ya existe un curso con el código ${data.codigo || currentCurso.codigo} para este ${alcanceToCheck.toLowerCase().replace('_', ' ')} y año académico`
        };
      }
    }

    // Verificar que las nuevas relaciones existan
    if (dataToSubmit.areaCurricularId || dataToSubmit.profesorId) {
      await validateRelations(dataToSubmit);
    }

    // Actualizar el curso
    const curso = await db.curso.update({
      where: { id },
      data: dataToSubmit,
      include: {
        areaCurricular: true,
        profesor: { select: { id: true, name: true, apellidoPaterno: true, email: true } },
        nivelAcademico: {
          include: {
            nivel: true,
            grado: true
          }
        },
        grado: true,
        nivel: true,
        institucion: true
      }
    });

    return { success: true, data: curso };

  } catch (error) {
    console.error("Error al actualizar curso:", error);

    // Manejar errores específicos de Prisma
    if (error.code === 'P2003') {
      return {
        success: false,
        error: `Error de relación: ${error.meta?.field_name || 'Un campo'} hace referencia a un registro que no existe`
      };
    } else if (error.code === 'P2002') {
      return {
        success: false,
        error: `Ya existe un curso con el mismo ${error.meta?.target?.join(', ') || 'identificador único'}`
      };
    }

    return { 
      success: false, 
      error: `Error al actualizar el curso: ${error.message || 'Error desconocido'}` 
    };
  }
}

/**
 * Valida que las relaciones existan en la base de datos
 * @param {Object} data - Datos a validar
 */
async function validateRelations(data) {
  // Validar área curricular
  if (data.areaCurricularId) {
    const areaCurricular = await db.areaCurricular.findUnique({
      where: { id: data.areaCurricularId }
    });
    if (!areaCurricular) {
      throw new Error('El área curricular especificada no existe');
    }
  }

  // Validar profesor
  if (data.profesorId) {
    const profesor = await db.user.findFirst({
      where: { 
        id: data.profesorId,
        role: 'profesor'
      }
    });
    if (!profesor) {
      throw new Error('El profesor especificado no existe o no tiene el rol de profesor');
    }
  }

  // Validar nivel académico
  if (data.nivelAcademicoId) {
    const nivelAcademico = await db.nivelAcademico.findUnique({
      where: { id: data.nivelAcademicoId }
    });
    if (!nivelAcademico) {
      throw new Error('El nivel académico especificado no existe');
    }
  }

  // Validar grado
  if (data.gradoId) {
    const grado = await db.grado.findUnique({
      where: { id: data.gradoId }
    });
    if (!grado) {
      throw new Error('El grado especificado no existe');
    }
  }

  // Validar nivel
  if (data.nivelId) {
    const nivel = await db.nivel.findUnique({
      where: { id: data.nivelId }
    });
    if (!nivel) {
      throw new Error('El nivel especificado no existe');
    }
  }

  // Validar institución
  if (data.institucionId) {
    const institucion = await db.institucionEducativa.findUnique({
      where: { id: data.institucionId }
    });
    if (!institucion) {
      throw new Error('La institución especificada no existe');
    }
  }
}

/**
 * Elimina un curso
 * @param {string} id - ID del curso
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCurso(id) {
  try {
    // Verificar si hay estudiantes, evaluaciones, etc. asociados
    const curso = await db.curso.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            estudiantes: true,
            evaluaciones: true,
            notas: true,
            asistencias: true
          }
        }
      }
    });

    if (!curso) {
      return { success: false, error: "Curso no encontrado" };
    }

    // Verificar si hay relaciones que impidan la eliminación
    const hasRelations =
      curso._count.estudiantes > 0 ||
      curso._count.evaluaciones > 0 ||
      curso._count.notas > 0 ||
      curso._count.asistencias > 0;

    if (hasRelations) {
      // En lugar de eliminar, desactivamos el curso
      await db.curso.update({
        where: { id },
        data: { activo: false }
      });
    } else {
      // Si no hay relaciones, podemos eliminar completamente
      // Primero eliminamos los horarios asociados
      await db.horario.deleteMany({
        where: { cursoId: id }
      });

      // Luego eliminamos el curso
      await db.curso.delete({
        where: { id }
      });
    }

    revalidatePath("/config/estructura-academica");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    return { success: false, error: "Error al eliminar el curso" };
  }
}

/**
 * Obtiene los horarios de un curso
 * @param {string} cursoId - ID del curso
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export async function getHorariosCurso(cursoId) {
  try {
    const horarios = await db.horario.findMany({
      where: { cursoId },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' }
      ]
    });

    return { success: true, data: horarios };
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return { success: false, error: "Error al cargar los horarios del curso" };
  }
}

/**
 * Crea un nuevo horario para un curso
 * @param {Object} data - Datos del horario
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createHorario(data) {
  try {
    // Verificar si ya existe un horario para el mismo día y hora
    const existingHorario = await db.horario.findFirst({
      where: {
        cursoId: data.cursoId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio
      }
    });

    if (existingHorario) {
      return {
        success: false,
        error: `Ya existe un horario para este curso en el mismo día y hora`
      };
    }

    const horario = await db.horario.create({
      data
    });

    revalidatePath("/config/estructura-academica");
    return { success: true, data: horario };
  } catch (error) {
    console.error("Error al crear horario:", error);
    return { success: false, error: "Error al crear el horario" };
  }
}

/**
 * Elimina un horario
 * @param {string} id - ID del horario
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteHorario(id) {
  try {
    await db.horario.delete({
      where: { id }
    });

    revalidatePath("/config/estructura-academica");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    return { success: false, error: "Error al eliminar el horario" };
  }
}
