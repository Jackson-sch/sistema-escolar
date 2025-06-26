"use client";

import { GenericDataTable } from "@/components/DataTable/GenericTable";
import { columns } from "./columns";
import ModalAdministrativo from "../modal-administrativo";
import RenderSubComponent from "./render-sub-component";
import TableHeaderActions from "@/components/DataTable/table-header-actions";
import { camposBusquedaAdministrativo } from "./campos-busqueda";

export default function AdministrativoTable({ data }) {
  // Filtrar para no mostrar al usuario con rol 'administrativo' y cargo 'administrador'
  const filteredData = data.filter(
    (item) =>
      !(
        item.role === "administrativo" &&
        item.cargo?.toLowerCase() === "administrador"
      )
  );

  return (
    <GenericDataTable
      columns={columns}
      data={filteredData}
      title="Lista de personal administrativo"
      description="Listado de personal administrativo"
      ActionComponent={<ModalAdministrativo />}
      getRowCanExpand={() => true}
      renderSubComponent={RenderSubComponent}
      TableHeaderComponent={
        <TableHeaderActions camposBusqueda={camposBusquedaAdministrativo} />
      }
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
    />
  );
}

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "email",
  "dni",
  "cargo",
  "area",
  "estado",
  "actions",
];
