"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNivelesAcademicos() {
  try {
    console.log("Obteniendo niveles académicos...");
    const niveles = await db.nivelAcademico.findMany({
      include: {
        nivel: true,  // Incluir la relación con nivel
        grado: true,  // Incluir la relación con grado
        _count: { select: { students: true } },
      },
    });
    
    console.log(`Se encontraron ${niveles.length} niveles académicos`);
    console.log("Estructura de un nivel académico:", niveles.length > 0 ? niveles[0] : "No hay niveles");
    
    return niveles.map((nivel) => ({
      ...nivel,
      cantidadEstudiantes: nivel._count.students,
    }));
  } catch (error) {
    console.error("Error al obtener niveles académicos:", error);
    return [];
  }
}

export async function createNivelAcademico(data) {
  try {
    // Buscar la primera institución disponible o crear una por defecto si no existe
    const institucion = await db.institucionEducativa.findFirst();
    
    if (!institucion) {
      throw new Error("No se encontró ninguna institución educativa. Por favor, crea una primero.");
    }
    
    // Agregar la relación con la institución
    const nivel = await db.nivelAcademico.create({
      data: {
        ...data,
        institucion: {
          connect: { id: institucion.id }
        }
      }
    });
    
    revalidatePath('/academico/niveles');
    return { success: true, data: nivel };
  } catch (error) {
    console.error("Error al crear nivel académico:", error.message);
    return { success: false, errors: error.message };
  }
}

export async function updateNivelAcademico(id, data) {
  try {
    const nivel = await db.nivelAcademico.update({ where: { id }, data });
    return { success: true, data: nivel };
  } catch (error) {
    console.error("Error al actualizar nivel académico:", error.message);
    return { success: false, errors: error.message };
  }
}

export async function deleteNivelAcademico(id) {
  try {
    await db.nivelAcademico.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar nivel académico:", error.message);
    return { success: false, errors: error.message };
  }
}
