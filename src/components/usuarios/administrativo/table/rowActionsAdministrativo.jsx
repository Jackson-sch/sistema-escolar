import { Button } from "@/components/ui/button";
import ModalPersonal from "../modal-administrativo";
import { useState } from "react";
import DeleteButton from "@/components/reutilizables/DeleteButton";
import {
  Trash2,
  Edit,
  Mail,
  MoreHorizontal,
  ClipboardCopy,
} from "lucide-react";
import { deleteAdministrativo } from "@/action/administrativo/administrativo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RowActionsPersonal({ administrativo }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
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
            <DropdownMenuLabel className="font-light">
              Acciones rápidas
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                window.open(`mailto:${administrativo.email}`, "_blank")
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar correo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopy(administrativo.email)}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copiar correo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopy(administrativo.dni)}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copiar DNI
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <DeleteButton
                id={administrativo.id}
                descriptionName={`personal ${administrativo.name}`}
                deleteAction={deleteAdministrativo}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isModalOpen && (
        <ModalPersonal
          administrativo={administrativo}
          institucionId={administrativo.institucionId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
