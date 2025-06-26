import { ArrowUpDown, ChevronRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RowActions from "@/components/usuarios/profesor/table/rowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/EstadoBadge";
import { EstadoProfesor } from "@/components/EstadoUsuarios";
import { colorClassesProfesor } from "@/lib/estadoColorClasses";

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
    header: ({ column }) => {
      return (
        <span
          className="cursor-pointer flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const profesor = row.original;
      return (
        <div className="flex flex-col leading-tight">
          <span className="capitalize truncate font-semibold font-sans">
            {profesor.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {profesor.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "dni",
    header: "DNI",
  },
  {
    accessorKey: "fechaContratacion",
    header: "F. Contratacion",
    cell: ({ row }) => {
      const date = new Date(row.getValue("fechaContratacion"));
      return (
        <span className="capitalize">{format(date, "PP", { locale: es })}</span>
      );
    },
  },
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }) => {
      const titulo = row.getValue("titulo");
      return <span className="text-nowrap">{titulo}</span>;
    },
  },
  {
    accessorKey: "especialidad",
    header: "Especialidad",
    cell: ({ row }) => {
      const especialidad = row.getValue("especialidad");
      return <Badge className="text-nowrap capitalize rounded-full">{especialidad}</Badge>;
    },
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion");
      return (
        <span className="truncate text-muted-foreground ">{direccion}</span>
      );
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono");
      return (
        <span className="text-nowrap">
          {telefono?.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}
        </span>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado");
      return <EstadoBadge estado={estado} estadosValidos={EstadoProfesor} colorClasses={colorClassesProfesor} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const profesor = row.original;

      return <RowActions profesor={profesor} />;
    },
  },
];
