"use client";

import { GenericDataTable } from "@/components/DataTable/GenericTable";
import ModalProfesor from "@/components/usuarios/profesor/profesor-modal";
import { columns } from "@/components/usuarios/profesor/table/columns";
import { renderSubComponent } from "@/components/usuarios/profesor/table/render-sub-component";
import TableHeaderActions from "@/components/DataTable/table-header-actions";
import { camposBusqueda } from "@/components/usuarios/profesor/table/campos-busqueda";

export function ProfesorTable({ data, institucionId }) {
  
  return (
    <GenericDataTable
      data={data}
      columns={columns}
      title="Lista de Profesores"
      description="Listado de profesores."
      ActionComponent={<ModalProfesor institucionId={institucionId} />}
      getRowCanExpand={() => true}
      renderSubComponent={renderSubComponent}
      TableHeaderComponent={
        <TableHeaderActions camposBusqueda={camposBusqueda} />
      }
    />
  );
}
