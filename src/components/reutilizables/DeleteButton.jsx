// components/shared/DeleteButton.jsx
"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DeleteButton({
  id,
  descriptionName = "elemento",
  deleteAction,
  onSuccess,
  className = "w-full",
  variant = "ghost",
  size = "sm",
  children = "Eliminar",
  disabled = false,
}) {
  const handleDelete = async () => {
    if (disabled) return;
    toast({
      title: `¿Estás seguro?`,
      description: `Esta acción eliminará permanentemente ${
        descriptionName ? `este ${descriptionName}` : "este elemento"
      }.`,
      action: (
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            try {
              await deleteAction(id);

              toast({
                title: "Éxito",
                description: `${
                  descriptionName.charAt(0).toUpperCase() +
                  descriptionName.slice(1)
                } eliminado correctamente`,
              });

              // Ejecutar callback de éxito si existe (ej: refrescar datos)
              /* if (typeof onSuccess === "function") {
                onSuccess();
              } */
            } catch (error) {
              toast({
                title: "Error",
                description:
                  error.message || `Error al eliminar ${descriptionName}`,
                variant: "destructive",
              });
            }
          }}
        >
          Eliminar
        </Button>
      ),
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={className}
            onClick={handleDelete}
            style={disabled ? { pointerEvents: "none", opacity: 0.5 } : {}}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent className="capitalize">{`Eliminar ${descriptionName}`}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
