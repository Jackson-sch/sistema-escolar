"use client";

import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Edit,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ButtonDelete from "@/components/reutilizables/DeleteButton";
import { NivelFilter } from "@/components/academico/niveles/table/FiltrosDataTable";
import Link from "next/link";
import { deleteStudent } from "@/action/estudiante/estudiante";
import {
  formatearNivel,
  gradoToNumber,
} from "@/components/formatearGrados";
import ModalEstudiante from "@/components/usuarios/estudiante/estudiante-modal";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EstadoEstudiante } from "@/components/EstadoUsuarios";
import { colorClassesEstudiante } from "@/lib/estadoColorClasses";
import { EstadoBadge } from "@/components/EstadoBadge";
import { formatPhone } from "@/lib/formatPhone";
import { useNivelGradoAcademico } from "@/hooks/utilidades";
import { formatDate } from "@/lib/dateUtils";

// Componente Badge para el nivel
const NivelBadge = ({ nivel }) => {
  const colorClasses = {
    INICIAL: "bg-blue-100 text-blue-800",
    PRIMARIA: "bg-green-100 text-green-800",
    SECUNDARIA: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[nivel] || "bg-gray-100 text-gray-800"
        }`}
    >
      {formatearNivel(nivel)}
    </span>
  );
};

export const columns = ({ niveles }) => [
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
    accessorKey: "codigoModular",
    header: "Código Modular",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <span className="text-muted-foreground">{student.codigoModular}</span>
      );
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
      const student = row.original;
      return (
        <div className="flex flex-col leading-tight">
          <span className="capitalize truncate font-semibold font-sans">
            {student.name}
          </span>
          <span className="text-muted-foreground text-xs">{student.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dni",
    header: "DNI",
    cell: ({ row }) => {
      const dni = row.getValue("dni");
      return <span className="font-mono">{dni}</span>;
    },
  },
  {
    accessorKey: "fechaNacimiento",
    header: "Fecha de Nacimiento",
    cell: ({ row }) => {
      const date = new Date(row.getValue("fechaNacimiento"));
      return formatDate(date);
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion");
      return <span>{direccion}</span>;
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono");
      return formatPhone(telefono);
    },
  },
  {
    accessorKey: "nivelAcademico.nivel.nombre",
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
              Nivel
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          </div>
          <NivelFilter column={column} />
        </div>
      );
    },
    cell: ({ row }) => {
      const nivelAcademico = row.original.nivelAcademico;
      if (!nivelAcademico || !nivelAcademico.nivel) return null;
      
      return <NivelBadge nivel={nivelAcademico.nivel.nombre} />;
    },
  },
  {
    accessorKey: "nivelAcademico.grado.nombre",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Grado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </div>
      );
    },
    cell: ({ row }) => {
      const nivelAcademico = row.original.nivelAcademico;
      if (!nivelAcademico || !nivelAcademico.grado) return null;
      
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{nivelAcademico.grado.nombre}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      // Acceder al código del grado, que ahora está en nivelAcademico.grado.codigo
      const gradoCodigoA = rowA.original.nivelAcademico?.grado?.codigo || "";
      const gradoCodigoB = rowB.original.nivelAcademico?.grado?.codigo || "";
      
      // Extraer la parte del grado (e.g., "PRIMERO" de "PRIMARIA_PRIMERO")
      const gradoA = gradoCodigoA.split("_")[1] || gradoCodigoA;
      const gradoB = gradoCodigoB.split("_")[1] || gradoCodigoB;
      
      return gradoToNumber(gradoA) - gradoToNumber(gradoB); // Compara los valores numéricos
    },
  },
  {
    accessorKey: "nivelAcademico.seccion",
    header: "Sección",
    cell: ({ row }) => {
      const nivelAcademico = row.original.nivelAcademico;
      return <Badge>{nivelAcademico?.seccion}</Badge>;
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado");
      return (
        <EstadoBadge
          estado={estado}
          estadosValidos={EstadoEstudiante}
          colorClasses={colorClassesEstudiante}
        />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      const [isModalOpen, setIsModalOpen] = useState(false);

      return (
        <>
          <div className="flex items-center justify-end gap-2">
            {/* Botón de edición rápida */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(student.codigoModular)
                  }
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copiar código modular
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link
                    href={`/estudiante/${student.id}/edit`}
                    className="flex"
                  >
                    <Edit2 className="mr-4 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <ButtonDelete
                    id={student.id}
                    descriptionName="estudiante"
                    deleteAction={deleteStudent}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isModalOpen && (
            <ModalEstudiante
              estudiante={student}
              niveles={niveles}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </>
      );
    },
  },
];
