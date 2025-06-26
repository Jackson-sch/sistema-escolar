import { getNivelesAcademicos } from "@/action/niveles/nivelAcademico";
import { StudentRegistrationForm } from "@/components/estudiante/formulario";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function StudentsPageEdit({ params }) {
  const { id } = await params;
  const niveles = await getNivelesAcademicos();
  const students = await db.user.findFirst({
    where: {
      id: id,
    },
    include: {
      nivelAcademico: {
        select: {
          nivel: true,
          grado: true,
          seccion: true,
        },
      },
    },
  });

  if (!students) {
    redirect("/estudiante/lista");
  }
  return <StudentRegistrationForm userData={students} niveles={niveles} />;
}
