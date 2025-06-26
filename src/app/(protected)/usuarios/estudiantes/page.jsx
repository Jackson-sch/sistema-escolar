import { getNivelesAcademicos } from "@/action/config/estructura-academica-action";
import { getStudents } from "@/action/estudiante/estudiante";
import EstudianteTable from "@/components/usuarios/estudiante/table/estudiante-table";

export default async function EstudiantePage() {
  const estudiantes = await getStudents();
  const { data: niveles } = await getNivelesAcademicos();

  return (
    <div className="container mx-auto">
      <EstudianteTable data={estudiantes} niveles={niveles} />
    </div>
  );
}
