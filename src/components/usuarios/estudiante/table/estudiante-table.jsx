"use client";

import { GenericDataTable } from "@/components/DataTable/GenericTable";
import ModalEstudiante from "@/components/usuarios/estudiante/estudiante-modal";
import { columns } from "@/components/usuarios/estudiante/table/columns";
import RenderSubComponent from "@/components/usuarios/estudiante/table/render-sub-component";
import TableHeaderActions from "@/components/DataTable/table-header-actions";
import { camposBusqueda } from "@/components/usuarios/estudiante/table/campos-busqueda";

export default function EstudianteTable({ data, niveles }) {
  return (
    <GenericDataTable
      data={data}
      columns={columns({ niveles })}
      title="Lista de Estudiantes"
      description="Listado de estudiantes."
      ActionComponent={<ModalEstudiante niveles={niveles} />}
      getRowCanExpand={() => true}
      renderSubComponent={(props) => <RenderSubComponent {...props} />}
      TableHeaderComponent={
        <TableHeaderActions camposBusqueda={camposBusqueda} />
      }
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
    />
  );
}

const INITIAL_VISIBLE_COLUMNS = ["id","name", "dni", "telefono", "nivel", "grado", "seccion", "estado", "actions"];