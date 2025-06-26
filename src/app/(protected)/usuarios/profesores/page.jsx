import { getProfesores } from "@/action/profesor/profesor";
import { ProfesorTable } from "@/components/usuarios/profesor/table/profesor-table";


export default async function ProfesorPage() {
  const profesores = await getProfesores();

  return (
    <div className="container mx-auto">
      <ProfesorTable data={profesores} />
    </div>
  );
}
