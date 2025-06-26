"use server";

import { db } from "@/lib/db";

export async function getRelacionFamiliar(id) {
  if (!id) return null;

  const relacion = await db.relacionFamiliar.findFirst({
    where: { hijoId: id, contactoPrimario: true },
    include: {
      padreTutor: true,
    },
  });

  return relacion?.padreTutor || null;
}

export async function getNumeroHijos(padreId) {
  if (!padreId) return 0;
  return await db.relacionFamiliar.count({ where: { padreTutorId: padreId } });
}

export async function getHijosDePadre(padreId) {
  if (!padreId) return [];
  const relaciones = await db.relacionFamiliar.findMany({
    where: { padreTutorId: padreId },
    include: {
      hijo: {
        include: { nivelAcademico: true },
      },
    },
  });
  return relaciones.map((rel) => rel.hijo);
}

export async function getStudentParent(estudianteId) {
  if (!estudianteId) return null;
  // Busca la relación familiar donde el hijo es el estudiante y el contacto primario es true
  const relacion = await db.relacionFamiliar.findFirst({
    where: { hijoId: estudianteId, contactoPrimario: true },
    include: { padreTutor: true },
  });
  if (relacion && relacion.padreTutor) {
    return { id: relacion.padreTutor.id, name: relacion.padreTutor.name };
  }
  return null;
}
