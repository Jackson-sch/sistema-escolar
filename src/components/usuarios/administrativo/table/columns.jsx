import { EstadoAdministrativo } from "@/components/EstadoUsuarios";
import { colorClassesAdministrativo } from "@/lib/estadoColorClasses";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import RowActionsPersonal from "./rowActionsAdministrativo";

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
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "dni",
    header: "DNI",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role");
      return role?.charAt(0).toUpperCase() + role?.slice(1) || "";
    },
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
  },
  {
    accessorKey: "area",
    header: "Área",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado");
      return (
        <EstadoBadge
          estado={estado}
          estadosValidos={EstadoAdministrativo}
          colorClasses={colorClassesAdministrativo}
        />
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <RowActionsPersonal administrativo={row.original} />
    ),
  },
];
