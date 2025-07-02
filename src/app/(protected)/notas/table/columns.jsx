"use client";

import { Eye, Edit, Trash2 } from "lucide-react";

export const columns = [
  {
    accessorKey: "estudiante",
    header: "Estudiante",
    cell: (info) => {
      const est = info.row.original.estudiante;
      return (
        <div>
          {est?.name} {est?.apellidoPaterno} {est?.apellidoMaterno}
        </div>
      );
    },
  },
  {
    accessorKey: "curso",
    header: "Curso",
    cell: (info) => {
      const curso = info.row.original.curso;
      return (
        <div>
          {curso?.nombre}{" "}
          <span className="text-xs text-muted-foreground">
            ({curso?.codigo})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "evaluacion",
    header: "Evaluación",
    cell: (info) => {
      const ev = info.row.original.evaluacion;
      return (
        <div>
          {ev?.nombre}{" "}
          <span className="text-xs text-muted-foreground">({ev?.tipo})</span>
        </div>
      );
    },
  },
  {
    accessorKey: "valor",
    header: "Nota",
  },
  {
    accessorKey: "valorLiteral",
    header: "Literal",
  },
  {
    accessorKey: "valorDescriptivo",
    header: "Descriptivo",
  },
  {
    accessorKey: "comentario",
    header: "Comentario",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha Registro",
    cell: (info) => new Date(info.getValue()).toLocaleString(),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: () => (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:underline">
          <Eye size={16} />
        </button>
        <button className="text-yellow-600 hover:underline">
          <Edit size={16} />
        </button>
        <button className="text-red-600 hover:underline">
          <Trash2 size={16} />
        </button>
      </div>
    ),
  },
];
