import { gradosPorNivel } from "@/lib/gradosPorNivel";
import RowActionsMatricula from "./rowActionsMatricula";

export const columns = [
  {
    accessorKey: "estudianteNombre",
    header: "Estudiante",
    cell: ({ row }) => {
      const nombre = row.original.estudianteNombre;
      return <span className="capitalize">{nombre}</span>;
    },
  },
  {
    accessorKey: "anioAcademico",
    header: "Año Académico",
  },
  {
    accessorKey: "responsableNombre",
    header: "Responsable",
    cell: ({ row }) => {
      const nombre = row.original.responsableNombre;
      return <span className="capitalize">{nombre}</span>;
    },
  },
  {
    accessorKey: "fechaMatricula",
    header: "Fecha Matrícula",
  },
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => <RowActionsMatricula matricula={row.original} />,
  },
];
