import { getCursos } from "@/action/cursos/curso";
import CursoTable from "@/components/academico/cursos/table/curso-table";


export default async function CursoPage() {
  const cursos = await getCursos();

  return <CursoTable data={cursos || []} />;
}
