
import { EstructuraAcademicaClient } from "./estructura-academica-client";
import { getNivelesAcademicos, getAreasCurriculares, getCursos } from "@/action/config/estructura-academica-action";
import { getInstituciones } from "@/action/config/institucion-action";
import { getProfesores } from "@/action/profesor/profesor";
import { getNiveles } from "@/action/config/niveles-grados-action";


export const metadata = {
  title: "Estructura Académica | Sistema Escolar",
  description: "Gestión de la estructura académica del sistema escolar",
};

export default async function EstructuraAcademicaPage() {
  const { data: instituciones = [] } = await getInstituciones();
  // getProfesores devuelve directamente un array, no un objeto con propiedad data
  const profesoresData = await getProfesores();
  // Obtener la primera institución (esto podría cambiarse para permitir seleccionar la institución)
  const institucion = instituciones[0];


  // Si no hay institución, mostrar mensaje de error
  if (!institucion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No hay instituciones registradas</h1>
          <p className="text-muted-foreground mt-2">
            Debe registrar una institución antes de gestionar la estructura académica
          </p>
        </div>
      </div>
    );
  }

  // Obtener niveles académicos iniciales para la institución
  const { data: nivelesAcademicos = [] } = await getNivelesAcademicos(institucion.id);

  // Obtener áreas curriculares iniciales para la institución
  const { data: areasCurriculares = [] } = await getAreasCurriculares(institucion.id);
  console.log("areasCurriculares", areasCurriculares)

  // Obtener niveles iniciales para la institución
  const { data: niveles = [] } = await getNiveles(institucion.id);

  return (
    <div className="container py-6">
      <EstructuraAcademicaClient
        institucion={institucion}
        nivelesAcademicosIniciales={nivelesAcademicos}
        areasCurricularesIniciales={areasCurriculares}
        profesoresIniciales={profesoresData}
        niveles={niveles}
      />
    </div>
  );
}
