import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  Edit,
  IdCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/reutilizables/DeleteButton";
import ModalProfesor from "@/components/usuarios/profesor/profesor-modal";
import { deleteProfesor } from "@/action/profesor/profesor";

// Componente de Acciones de fila con UX mejorado
const RowActions = ({ profesor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* Botón de edición rápida*/}
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
            <DropdownMenuLabel className="flex flex-col font-light">
              Acciones para:
              <span className="text-xs capitalize text-muted-foreground">
                {profesor.name}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar detalles
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => window.open(`mailto:${profesor.email}`, "_blank")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(profesor.dni)}
            >
              <IdCard className="mr-2 h-4 w-4" />
              Copiar DNI
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(profesor.telefono)}
            >
              <Phone className="mr-2 h-4 w-4" />
              Copiar teléfono
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <DeleteButton
                id={profesor.id}
                descriptionName={`profesor ${profesor.name}`}
                deleteAction={deleteProfesor}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isModalOpen && (
        <ModalProfesor
          profesor={profesor}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default RowActions;
