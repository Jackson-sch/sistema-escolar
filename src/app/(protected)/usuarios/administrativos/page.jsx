import { getAdministrativos } from "@/action/administrativo/administrativo";
import PersonalTable from "@/components/usuarios/administrativo/table/administrativo-table";
import { getInstituciones } from "@/action/config/institucion-action";

export default async function AdministrativosPage() {
  // Obtener la institución (para ahora usamos la primera, en un futuro podría ser seleccionable)
  const { data: instituciones = [] } = await getInstituciones();
  const institucion = instituciones[0] || {};
  const institucionId = institucion?.id || "";
  
  // Obtener administrativos de la institución
  const administrativos = await getAdministrativos(institucionId);
  console.log("administrativos", administrativos);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Personal</h1>
      <PersonalTable data={administrativos} institucionId={institucionId} />
    </div>
  );
}
