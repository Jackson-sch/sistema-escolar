import { getPadres } from "@/action/padre/padre";
import PadreTable from "@/components/usuarios/padre/table/padre-table";


export default async function PadrePage() {
  const padres = await getPadres();

  return (
    <div className="container mx-auto">
      <PadreTable data={padres} />
    </div>
  );
}
