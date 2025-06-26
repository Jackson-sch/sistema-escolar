'use client'
import { GenericDataTable } from "@/components/DataTable/GenericTable";
import React from "react";
import { columns } from "./columns";
import ModalMatricula from "../ModalMatricula";

export default function MatriculaTable({ data }) {
  return (
    <GenericDataTable
      data={data}
      columns={columns}
      title="Lista de Matriculas"
      description="Listado de matriculas."
      ActionComponent={<ModalMatricula />}
      /* getRowCanExpand={() => true}
      renderSubComponent={(props) => <RenderSubComponent {...props} />}
      TableHeaderComponent={
        <TableHeaderActions camposBusqueda={camposBusqueda} />
      }
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS} */
    />
  );
}
