"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNivelesAcademicos() {
  const niveles = await db.nivelAcademico.findMany({
    orderBy: [{ nivel: "asc" }, { grado: "asc" }, { seccion: "asc" }],
    select: {
      id: true,
      nivel: true,
      grado: true,
      seccion: true,
      _count: { select: { students: true } },
    },
  });
  return niveles.map((nivel) => ({
    ...nivel,
    cantidadEstudiantes: nivel._count.students,
  }));
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
