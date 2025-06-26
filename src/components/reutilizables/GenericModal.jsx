"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle } from "lucide-react";

export default function GenericModal({
  // Props para personalizar el componente
  entityName = "item",           // Nombre de la entidad (ej: "nivel académico", "usuario", etc.)
  entityData = null,             // Datos de la entidad si estamos editando
  FormComponent,                 // Componente de formulario a renderizar
  buttonSize = "default",        // Tamaño del botón
  buttonVariant = "default",     // Variante del botón
  modalWidth = "sm:max-w-[425px]", // Ancho del modal
  customTrigger = null,          // Trigger personalizado
  icon = {                       // Iconos personalizables
    create: PlusCircle,
    edit: Edit
  },
  labels = {                     // Textos personalizables
    create: "Nuevo",
    edit: "Editar",
    createDescription: "Ingresa los datos del nuevo",
    editDescription: "Actualiza los datos del"
  },
  isOpen = undefined,            // Estado controlado externamente (opcional)
  onClose = undefined,           // Función para cerrar externamente (opcional)
}) {
  // Si isOpen es undefined, utilizamos nuestro propio estado interno
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Determinar si estamos controlados externamente o no
  const isControlled = isOpen !== undefined;
  const dialogOpen = isControlled ? isOpen : internalOpen;
  
  const isEditing = !!entityData;
  
  const handleOpenChange = (open) => {
    if (isControlled) {
      // Si somos controlados externamente, llamamos a onClose cuando se cierra
      if (!open && onClose) {
        onClose();
      }
    } else {
      // Si no somos controlados, actualizamos nuestro estado interno
      setInternalOpen(open);
    }
  };

  const handleSuccess = () => {
    handleOpenChange(false);
  };

  // Icon components
  const CreateIcon = icon.create;
  const EditIcon = icon.edit;

  // Renderizar el trigger personalizado o el botón predeterminado
  const renderTrigger = () => {
    // Si somos controlados externamente, no necesitamos un trigger
    if (isControlled) {
      return null;
    }
    
    if (customTrigger) {
      return React.cloneElement(customTrigger, {
        onClick: () => setInternalOpen(true)
      });
    }
    
    return (
      <Button
        variant={isEditing ? (buttonVariant === "default" ? "icon" : buttonVariant) : buttonVariant}
        size={isEditing ? (buttonSize === "default" ? "md" : buttonSize) : buttonSize}
        onClick={() => setInternalOpen(true)}
      >
        {isEditing ? (
          <>
            <EditIcon className="mr-2 h-4 w-4" />
            {labels.edit !== "" && <span>{labels.edit}</span>}
          </>
        ) : (
          <>
            <CreateIcon className="mr-2 h-4 w-4" />
            <span>{`${labels.create} ${entityName}`}</span>
          </>
        )}
      </Button>
    );
  };
  
  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {renderTrigger()}
        </DialogTrigger>
      )}
      <DialogContent className={`${modalWidth} w-full max-w-full overflow-y-auto max-h-svh`}>
        <DialogHeader>
          <DialogTitle className="text-2xl capitalize">
            {isEditing ? labels.edit : labels.create} {entityName}
          </DialogTitle>
          <DialogDescription>
            <span className="text-xs text-default-foreground">
              {isEditing
                ? `${labels.editDescription} ${entityName}`
                : `${labels.createDescription} ${entityName}`}
            </span>
          </DialogDescription>
        </DialogHeader>
        <FormComponent
          data={entityData}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}