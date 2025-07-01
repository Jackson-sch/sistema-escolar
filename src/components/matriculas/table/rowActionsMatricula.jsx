import { useState } from "react";

import { deleteMatricula } from "@/action/matricula/matricula";
import DeleteButton from "@/components/reutilizables/DeleteButton";
import ModalMatricula from "@/components/matriculas/ModalMatricula";
import { Button } from "@/components/ui/button";

import { Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RowActionsMatricula({ matricula }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DeleteButton
          id={matricula.id}
          descriptionName={`matricula ${matricula.estudianteNombre}`}
          deleteAction={deleteMatricula}
          children={<Trash2 className="h-4 w-4" />}
          className="w-full cursor-pointer"
        />
      </div>
      {isModalOpen && (
        <ModalMatricula
          matricula={matricula}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
