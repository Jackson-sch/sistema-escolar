import { getMatriculas } from "@/action/matricula/matricula";
import MatriculaTable from "@/components/matriculas/table/matricula-table";

export default async function MatriculasPage() {
  const matriculas = await getMatriculas();
  console.log("Matriculas:", matriculas);

  return (
    <div className="container mx-auto py-6">
      <MatriculaTable data={matriculas} />
    </div>
  );
}
