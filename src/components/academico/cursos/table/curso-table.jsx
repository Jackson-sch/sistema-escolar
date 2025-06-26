"use client";

import { GenericDataTable } from "@/components/DataTable/GenericTable";
import TableHeaderActions from "@/components/DataTable/table-header-actions";
import { columns } from "./columns";
import { camposBusqueda } from "./camposBusqueda";
import ModalCurso from "../ModalCurso";
import { useMemo } from "react";

export default function CursoTable({ data }) {
  // Crear una referencia estable al componente de acción usando useMemo
  const ActionComponent = useMemo(() => {
    return ModalCurso;
  }, []);

  return (
    <GenericDataTable
      data={data}
      columns={columns}
      title="Lista de Cursos"
      description="Listado de cursos."
      ActionComponent={ActionComponent}
      /* getRowCanExpand={() => true}
      renderSubComponent={(props) => <RenderSubComponent {...props} />} */
      TableHeaderComponent={
        <TableHeaderActions camposBusqueda={camposBusqueda} />
      }
      /* initialVisibleColumns={INITIAL_VISIBLE_COLUMNS} */
    />
  );
}
