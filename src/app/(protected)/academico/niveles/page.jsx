import { getNivelesAcademicos } from "@/action/niveles/nivelAcademico";

import { NivelAcademicoTable } from "@/components/academico/niveles/table/nivel-academico-table";

export default async function NivelAcademicoPage() {
  const niveles = await getNivelesAcademicos();

  return (
    <div className="container mx-auto">
      <NivelAcademicoTable niveles={niveles} />
    </div>
  );
}
