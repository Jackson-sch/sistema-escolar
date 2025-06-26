import { Badge } from "@/components/ui/badge";
import RowActionsPadre from "@/components/usuarios/padre/table/rowActionsPadre";
import { useNumeroHijos } from "@/hooks/entidades";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

export const columns = [
  {
    accessorKey: "id",
    header: null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="icon"
          {...{
            onClick: row.getToggleExpandedHandler(),
            className: "cursor-pointer",
          }}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "name",
    header: "Nombres y Apellidos",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.name}</span>;
    },
  },
  {
    accessorKey: "dni",
    header: "DNI",
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.direccion}</span>;
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
  },
  {
    accessorKey: "ocupacion",
    header: "Ocupación",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.ocupacion}</span>;
    },
  },
  {
    accessorKey: "lugarTrabajo",
    header: "Lugar de trabajo",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.lugarTrabajo}</span>;
    },
  },
  {
    header: "N° Hijos",
    id: "numHijos",
    cell: ({ row }) => {
      const numHijos = useNumeroHijos(row.original.id);
      return (
        <Badge
          variant="outline"
          className="font-mono text-md rounded-full shadow-md"
        >
          {numHijos}
        </Badge>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant={row.original.estado === "activo" ? "default" : "outline"}>
        {row.original.estado}
      </Badge>
    ),
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => <RowActionsPadre padre={row.original} />,
  },
];
