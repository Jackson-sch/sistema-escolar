import { useState } from "react";

import { deletePadre } from "@/action/padre/padre";
import DeleteButton from "@/components/reutilizables/DeleteButton";
import PadreModal from "@/components/usuarios/padre/padre-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ClipboardCopy,
  Edit,
  Mail,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

export default function RowActionsPadre({ padre }) {
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
              onClick={() => window.open(`mailto:${padre.email}`, "_blank")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar correo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopy(padre.email)}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copiar correo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopy(padre.dni)}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copiar DNI
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <DeleteButton
                id={padre.id}
                descriptionName={`padre ${padre.name}`}
                deleteAction={deletePadre}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isModalOpen && (
        <PadreModal
          padre={padre}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
