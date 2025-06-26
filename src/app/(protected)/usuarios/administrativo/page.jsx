import { getAdministrativos } from "@/action/administrativo/administrativo";
import AdministrativoTable from "@/components/administrativo/table/administrativo-table";

export default async function AdministrativoPage() {
  const administrativos = await getAdministrativos();
  return (
    <div className="container mx-auto">
      <AdministrativoTable data={administrativos} />
    </div>
  );
}
