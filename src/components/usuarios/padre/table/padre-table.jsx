"use client";

import { GenericDataTable } from "@/components/DataTable/GenericTable";
import { columns } from "@/components/usuarios/padre/table/columns";
import TableHeaderActions from "@/components/DataTable/table-header-actions";
import { camposBusqueda } from "@/components/usuarios/padre/table/campos-busqueda";
import PadreModal from "@/components/usuarios/padre/padre-modal";
import RenderSubComponent from "@/components/usuarios/padre/table/render-sub-component";

export default function PadreTable({ data }) {
  return (
    <GenericDataTable
      data={data}
      columns={columns}
      title="Lista de Padres/Tutores"
      description="Gestión de padres y tutores registrados en el sistema."
      ActionComponent={<PadreModal />}
      getRowCanExpand={() => true}
      renderSubComponent={(props) => <RenderSubComponent {...props} />}
      TableHeaderComponent={
        <TableHeaderActions camposBusqueda={camposBusqueda} />
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
  "direccion",
  "lugarTrabajo",
  "ocupacion",
  "telefono",
  "numHijos",
  "estado",
  "actions",
];
