"use client";


import TableHeaderActions from "@/components/academico/niveles/table/table-header";
import NivelAcademicoModal from "@/components/academico/niveles/modal";
import { GenericDataTable } from "@/components/DataTable/GenericTable";
import { columns } from "./columns";

export function NivelAcademicoTable({ niveles }) {
  return (
    <GenericDataTable
      data={niveles}
      columns={columns}
      title="Lista de Niveles Académicos"
      description="Listado de niveles académicos."
      ActionComponent={<NivelAcademicoModal />}
      TableHeaderComponent={<TableHeaderActions />}
    />
  );
}
