import { EstadoAdministrativo } from "@/components/EstadoUsuarios";
import { colorClassesAdministrativo } from "@/lib/estadoColorClasses";
import { EstadoBadge } from "@/components/EstadoBadge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import ModalEstudiante from "@/components/estudiante/estudiante-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { deleteStudent } from "@/action/estudiante/estudiante";
import { deleteAdministrativo } from "@/action/administrativo/administrativo";
import DeleteButton from "@/components/reutilizables/DeleteButton";
import ModalAdministrativo from "../modal-administrativo";
import RowActionsAdministrativo from "./rowActionsAdministrativo";

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
      <RowActionsAdministrativo administrativo={row.original} />
    ),
  },
];
