import React from "react";
import EvaluacionesClient from "./EvaluacionesClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { getPeriodos } from "@/action/config/periodo-action";
import { obtenerCursosPorEstudiante, obtenerCursosPorProfesor } from "@/action/cursos/curso";
import { db } from "@/lib/db";

export default async function EvaluacionesPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  let cursos = [];
  
  // Obtener la institución del usuario
  const usuario = await db.user.findUnique({
    where: { id: session.user.id },
    select: { institucionId: true }
  });
  
  // Obtener los periodos académicos de la institución
  const periodosResult = await getPeriodos(usuario?.institucionId);
  const periodos = periodosResult?.success ? periodosResult.data : [];

  // Obtener cursos según el rol del usuario
  if (session.user.role === "PROFESOR" || session.user.role === "profesor") {
    cursos = await obtenerCursosPorProfesor(session.user.id);
  } else if (session.user.role === "ESTUDIANTE" || session.user.role === "estudiante") {
    cursos = await obtenerCursosPorEstudiante(session.user.id);
  } else if (session.user.role === "ADMIN" || session.user.role === "admin") {
    // Para administradores, idealmente obtener todos los cursos
    // Por ahora, usamos los cursos del profesor como ejemplo
    cursos = await obtenerCursosPorProfesor(session.user.id);
  }

  return (
    <EvaluacionesClient
      user={session.user}
      cursos={cursos}
      periodos={periodos}
    />
  );
}
