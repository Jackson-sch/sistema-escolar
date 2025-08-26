import {
  User,
  Calendar,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RowActionsMatricula from "./rowActionsMatricula";

export const columns = [
  {
    accessorKey: "estudianteNombre",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-blue-600" />
        <span>Estudiante</span>
      </div>
    ),
    cell: ({ row }) => {
      const nombre = row.original.estudianteNombre;
      return (
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
            <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="capitalize font-medium">{nombre}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "anioAcademico",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-purple-600" />
        <span>Año Académico</span>
      </div>
    ),
    cell: ({ row }) => {
      const anio = row.original.anioAcademico;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200"
          >
            {anio}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "responsableNombre",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-green-600" />
        <span>Responsable</span>
      </div>
    ),
    cell: ({ row }) => {
      const nombre = row.original.responsableNombre;
      return (
        <div className="flex items-center gap-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
            <UserCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
          <span className="capitalize text-sm">{nombre}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "fechaMatricula",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-orange-600" />
        <span>Fecha Matrícula</span>
      </div>
    ),
    cell: ({ row }) => {
      const fecha = row.original.fechaMatricula;
      const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return (
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full">
            <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-sm font-mono">{fechaFormateada}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado;

      const getEstadoConfig = (estado) => {
        switch (estado?.toLowerCase()) {
          case "activo":
            return {
              variant: "default",
              className:
                "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200",
              icon: <CheckCircle className="h-3 w-3" />,
            };
          case "inactivo":
            return {
              variant: "secondary",
              className:
                "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200",
              icon: <XCircle className="h-3 w-3" />,
            };
          case "pendiente":
            return {
              variant: "outline",
              className:
                "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200",
              icon: <AlertCircle className="h-3 w-3" />,
            };
          default:
            return {
              variant: "outline",
              className:
                "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200",
              icon: <AlertCircle className="h-3 w-3" />,
            };
        }
      };

      const config = getEstadoConfig(estado);

      return (
        <Badge
          variant={config.variant}
          className={`flex items-center gap-1 ${config.className}`}
        >
          {config.icon}
          <span className="capitalize">{estado}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => <RowActionsMatricula matricula={row.original} />,
  },
];
