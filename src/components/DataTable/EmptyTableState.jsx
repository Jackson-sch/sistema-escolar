import React from "react";
import { FolderOpen } from "lucide-react";

export function EmptyTableState({
  message = "No hay datos disponibles",
  description = "No se encontraron registros para mostrar.",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 ">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
        {description}
      </p>
    </div>
  );
}
