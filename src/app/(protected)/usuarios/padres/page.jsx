import { getInstitucionById, getInstituciones } from "@/action/config/institucion-action";
import { getPadres } from "@/action/padre/padre";
import PadreTable from "@/components/usuarios/padre/table/padre-table";


export default async function PadrePage() {
  const padres = await getPadres();

  const { data: instituciones = [] } = await getInstituciones();
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
  return (
    <div className="container mx-auto">
      <PadreTable data={padres} institucionId={institucion.id} />
    </div>
  );
}
