"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todas las instituciones educativas
 * @returns {Promise<Array>} Lista de instituciones educativas
 */
export async function getInstituciones() {
  try {
    const instituciones = await db.institucionEducativa.findMany({
      orderBy: { nombreInstitucion: "asc" },
      include: {
        director: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true,
          },
        },
        niveles: true, // Incluir la relación con niveles
        _count: {
          select: {
            users: true,
            nivelesAcademicos: true,
          },
        },
      },
    });
    
    return { success: true, data: instituciones };
  } catch (error) {
    console.error("Error al obtener instituciones:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene una institución educativa por su ID
 * @param {string} id - ID de la institución
 * @returns {Promise<Object>} Datos de la institución
 */
export async function getInstitucionById(id) {
  try {
    const institucion = await db.institucionEducativa.findUnique({
      where: { id },
      include: {
        director: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true,
          },
        },
        nivelesAcademicos: true,
        periodos: true,
        areasCurriculares: true,
      },
    });
    
    if (!institucion) {
      return { success: false, error: "Institución no encontrada" };
    }
    
    return { success: true, data: institucion };
  } catch (error) {
    console.error(`Error al obtener institución ${id}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Crea una nueva institución educativa
 * @param {Object} data - Datos de la institución
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function createInstitucion(data) {
  try {
    // Validar datos obligatorios
    const requiredFields = [
      "codigoModular",
      "nombreInstitucion",
      "tipoGestion",
      "modalidad",
      "niveles",
      "ugel",
      "dre",
      "ubigeo",
      "direccion",
      "distrito",
      "provincia",
      "departamento",
      "fechaInicioClases",
      "fechaFinClases",
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return { success: false, error: `El campo ${field} es obligatorio` };
      }
    }
    
    // Verificar si ya existe una institución con el mismo código modular
    const existingInstitucion = await db.institucionEducativa.findUnique({
      where: { codigoModular: data.codigoModular },
    });
    
    if (existingInstitucion) {
      return { 
        success: false, 
        error: `Ya existe una institución con el código modular ${data.codigoModular}` 
      };
    }
    
    // Crear la institución
    const institucion = await db.institucionEducativa.create({
      data: {
        codigoModular: data.codigoModular,
        nombreInstitucion: data.nombreInstitucion,
        nombreComercial: data.nombreComercial,
        tipoGestion: data.tipoGestion,
        modalidad: data.modalidad,
        // Eliminamos niveles de aquí ya que es una relación que debe crearse por separado
        ugel: data.ugel,
        dre: data.dre,
        ubigeo: data.ubigeo,
        direccion: data.direccion,
        distrito: data.distrito,
        provincia: data.provincia,
        departamento: data.departamento,
        telefono: data.telefono,
        email: data.email,
        sitioWeb: data.sitioWeb,
        resolucionCreacion: data.resolucionCreacion,
        fechaCreacion: data.fechaCreacion,
        resolucionActual: data.resolucionActual,
        logo: data.logo,
        directorId: data.directorId,
        cicloEscolarActual: data.cicloEscolarActual || 2025,
        fechaInicioClases: data.fechaInicioClases,
        fechaFinClases: data.fechaFinClases,
      },
    });
    
    // Crear los niveles relacionados después de crear la institución
    if (data.niveles && data.niveles.length > 0) {
      // Para cada nivel seleccionado en el formulario, creamos un registro en la tabla Nivel
      for (const nivelNombre of data.niveles) {
        await db.nivel.create({
          data: {
            nombre: nivelNombre,
            descripcion: `Nivel ${nivelNombre} de ${data.nombreInstitucion}`,
            institucion: {
              connect: {
                id: institucion.id
              }
            }
          }
        });
      }
    }
    
    revalidatePath("/config/institucion");
    return { success: true, data: institucion };
  } catch (error) {
    console.error("Error al crear institución:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza una institución educativa existente
 * @param {string} id - ID de la institución
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateInstitucion(id, data) {
  try {
    // Validar que exista la institución
    const existeInstitucion = await db.institucionEducativa.findUnique({
      where: { id },
    });
    
    if (!existeInstitucion) {
      return { success: false, error: "Institución no encontrada" };
    }
    
    // Limpiar datos para manejar campos opcionales vacíos
    const datosLimpios = {};
    
    // Extraer niveles antes de procesar los demás campos
    const niveles = data.niveles;
    delete data.niveles; // Eliminamos niveles del objeto data para no incluirlo en la actualización directa
    
    // Recorrer todas las propiedades y filtrar valores null/undefined para campos opcionales
    Object.keys(data).forEach(key => {
      // Si el valor es null o undefined y es un campo opcional, no lo incluimos
      // Excepto si queremos explícitamente establecer un campo como null
      if (data[key] !== null && data[key] !== undefined) {
        datosLimpios[key] = data[key];
      }
    });
    
    // Actualizar la institución con los datos limpios
    const institucionActualizada = await db.institucionEducativa.update({
      where: { id },
      data: datosLimpios,
      include: {
        director: {
          select: {
            id: true,
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true,
          },
        },
        niveles: true,
      },
    });
    
    // Actualizar los niveles si se proporcionaron nuevos valores
    if (niveles && niveles.length > 0) {
      // Primero, obtener los niveles actuales
      const nivelesActuales = await db.nivel.findMany({
        where: { institucionId: id },
        select: { id: true, nombre: true }
      });
      
      // Eliminar niveles que ya no están en la lista
      for (const nivel of nivelesActuales) {
        if (!niveles.includes(nivel.nombre)) {
          // Verificar si el nivel tiene relaciones antes de eliminar
          const tieneRelaciones = await db.nivel.findFirst({
            where: { id: nivel.id },
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
          
          const tieneElementosRelacionados = Object.values(tieneRelaciones._count).some(count => count > 0);
          
          if (!tieneElementosRelacionados) {
            await db.nivel.delete({ where: { id: nivel.id } });
          }
        }
      }
      
      // Agregar nuevos niveles que no existan
      for (const nivelNombre of niveles) {
        const nivelExistente = nivelesActuales.find(n => n.nombre === nivelNombre);
        
        if (!nivelExistente) {
          await db.nivel.create({
            data: {
              nombre: nivelNombre,
              descripcion: `Nivel ${nivelNombre} de ${institucionActualizada.nombreInstitucion}`,
              institucion: {
                connect: { id }
              }
            }
          });
        }
      }
    }
    
    // Revalidar rutas para actualizar la UI
    revalidatePath("/config/institucion");
    revalidatePath("/academico/niveles");
    
    return { success: true, data: institucionActualizada };
  } catch (error) {
    console.error(`Error al actualizar institución ${id}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una institución educativa
 * @param {string} id - ID de la institución
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteInstitucion(id) {
  try {
    // Verificar si la institución existe
    const existingInstitucion = await db.institucionEducativa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            nivelesAcademicos: true,
            periodos: true,
            areasCurriculares: true,
          },
        },
      },
    });
    
    if (!existingInstitucion) {
      return { success: false, error: "Institución no encontrada" };
    }
    
    // Verificar si tiene elementos relacionados
    const relatedItems = {
      users: existingInstitucion._count.users,
      nivelesAcademicos: existingInstitucion._count.nivelesAcademicos,
      periodos: existingInstitucion._count.periodos,
      areasCurriculares: existingInstitucion._count.areasCurriculares,
    };
    
    const hasRelatedItems = Object.values(relatedItems).some(count => count > 0);
    
    if (hasRelatedItems) {
      return { 
        success: false, 
        error: "No se puede eliminar la institución porque tiene elementos relacionados",
        relatedItems
      };
    }
    
    // Eliminar la institución
    await db.institucionEducativa.delete({
      where: { id },
    });
    
    revalidatePath("/config/institucion");
    return { success: true };
  } catch (error) {
    console.error(`Error al eliminar institución ${id}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Asigna un director a una institución educativa
 * @param {string} institucionId - ID de la institución
 * @param {string} directorId - ID del usuario director
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function asignarDirector(institucionId, directorId) {
  try {
    // Verificar si la institución existe
    const institucion = await db.institucionEducativa.findUnique({
      where: { id: institucionId },
    });
    
    if (!institucion) {
      return { success: false, error: "Institución no encontrada" };
    }
    
    // Verificar si el usuario existe y tiene rol de director
    const usuario = await db.user.findUnique({
      where: { id: directorId },
    });
    
    if (!usuario) {
      return { success: false, error: "Usuario no encontrado" };
    }
    
    if (usuario.role !== "director") {
      return { success: false, error: "El usuario no tiene rol de director" };
    }
    
    // Actualizar la institución con el nuevo director
    const updated = await db.institucionEducativa.update({
      where: { id: institucionId },
      data: { directorId },
    });
    
    revalidatePath("/config/institucion");
    return { success: true, data: updated };
  } catch (error) {
    console.error(`Error al asignar director:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el ciclo escolar actual de una institución
 * @param {string} id - ID de la institución
 * @param {number} ciclo - Nuevo ciclo escolar (año)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function actualizarCicloEscolar(id, ciclo) {
  try {
    const institucion = await db.institucionEducativa.update({
      where: { id },
      data: { cicloEscolarActual: ciclo },
    });
    
    revalidatePath("/config/institucion");
    return { success: true, data: institucion };
  } catch (error) {
    console.error(`Error al actualizar ciclo escolar:`, error.message);
    return { success: false, error: error.message };
  }
}