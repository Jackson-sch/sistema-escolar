import { ArrowUpDown, Trash2 } from "lucide-react";
import DeleteButton from "@/components/reutilizables/DeleteButton";
import { deleteNivelAcademico } from "@/action/niveles/nivelAcademico";
import {
  GradoFilter,
  NivelFilter,
} from "@/components/academico/niveles/table/FiltrosDataTable";
import { formatearGrado } from "@/components/formatearGrados";
import NivelAcademicoModal from "@/components/academico/niveles/modal";

import { Badge } from "@/components/ui/badge";

// Columnas de la tabla
export const columns = [
  /*   {
    id: "id",
    header: "N°",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
  }, */
  {
    accessorKey: "nivel",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="cursor-pointer flex items-center p-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nivel
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          </div>
          <NivelFilter column={column} />
        </div>
      );
    },
    cell: ({ row }) => {
      const nivelAcademico = row.original.nivel;
      return nivelAcademico ? (
        <span className="capitalize text-xs">{nivelAcademico}</span>
      ) : null;
    },
  },
  {
    accessorKey: "grado",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className="cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Grado
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          </div>
          <GradoFilter column={column} />
        </div>
      );
    },
    cell: ({ row }) => <span>{formatearGrado(row.original.grado)}</span>,
  },
  {
    accessorKey: "seccion",
    header: ({ column }) => {
      return (
        <div className="flex justify-center items-center gap-2">
          <span
            className="cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sección
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-auto ">
        <span className="capitalize">
          {row.original.seccion || "Sin sección"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "cantidadEstudiantes",
    header: ({ column }) => {
      return (
        <div className="flex justify-center items-center gap-2">
          <span
            className="cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estudiantes
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Badge className="font-semibold">
          {row.original.cantidadEstudiantes}
        </Badge>
      </div>
    ),
  },

  {
    id: "Acciones",
    enableHiding: false,
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {/* <Link href={`/nivel-academico/${row.original.id}/edit`}>
          <Button variant="icon" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </Link> */}
        <NivelAcademicoModal nivelAcademicoData={row.original} />
        <DeleteButton
          id={row.original.id}
          descriptionName="nivel Académico"
          deleteAction={deleteNivelAcademico}
          className="cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </DeleteButton>
      </div>
    ),
  },
];
