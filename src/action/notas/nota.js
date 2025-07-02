"use server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Obtiene todas las notas según el rol del usuario
export async function getNotasPorProfesor() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = session.user.id;
  const userRole = session.user.role;

  // Si es administrador o director, ve todas las notas
  if (userRole === "administrativo" || userRole === "director") {
    return await db.nota.findMany({
      include: {
        estudiante: {
          select: { name: true, apellidoPaterno: true, apellidoMaterno: true },
        },
        curso: { select: { nombre: true, codigo: true } },
        evaluacion: { select: { nombre: true, tipo: true } },
      },
      orderBy: { fechaRegistro: "desc" },
    });
  }

  // Si es profesor, solo las de sus cursos
  const cursos = await db.curso.findMany({
    where: { profesorId: userId },
    select: { id: true },
  });
  const cursosIds = cursos.map((c) => c.id);
  if (cursosIds.length === 0) return [];

  return await db.nota.findMany({
    where: { cursoId: { in: cursosIds } },
    include: {
      estudiante: {
        select: { name: true, apellidoPaterno: true, apellidoMaterno: true },
      },
      curso: { select: { nombre: true, codigo: true } },
      evaluacion: { select: { nombre: true, tipo: true } },
    },
    orderBy: { fechaRegistro: "desc" },
  });
}
