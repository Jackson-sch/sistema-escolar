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
import { Edit, PlusCircle, View } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export default function GenericModal({
  // Props para personalizar el componente
  entityName = "item", // Nombre de la entidad (ej: "nivel académico", "usuario", etc.)
  entityData = null, // Datos de la entidad si estamos editando
  FormComponent, // Componente de formulario a renderizar
  buttonSize = "default", // Tamaño del botón
  buttonVariant = "default", // Variante del botón
  modalWidth = "sm:max-w-[425px]", // Ancho del modal (xs, sm, md, lg, xl, 2xl, full o valor personalizado)
  customTrigger = null, // Trigger personalizado
  icon = {
    // Iconos personalizables
    create: PlusCircle,
    edit: Edit,
  },
  labels = {
    // Textos personalizables
    create: "Nuevo",
    edit: "Editar",
    createDescription: "Ingresa los datos del nuevo",
    editDescription: "Actualiza los datos del",
  },
  isOpen = undefined, // Estado controlado externamente (opcional)
  onClose = undefined, // Función para cerrar externamente (opcional)
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

  // Función para convertir valores de tamaño predefinidos en clases CSS
  const getModalWidthClass = (width) => {
    // Si ya es una clase CSS completa, la devolvemos tal cual
    if (width.includes("max-w-") || width.includes("w-")) {
      return width;
    }

    // Mapeo de tamaños predefinidos a clases de Tailwind
    const sizeMap = {
      xs: "sm:max-w-[320px]",
      sm: "sm:max-w-[425px]",
      md: "sm:max-w-[550px]",
      lg: "sm:max-w-[680px]",
      xl: "sm:max-w-[900px]",
      "2xl": "sm:max-w-[1100px]",
      "3xl": "sm:max-w-[1200px]",
      "4xl": "sm:max-w-[1300px]",
      "5xl": "sm:max-w-[1400px]",
      "6xl": "sm:max-w-[1500px]",
      "7xl": "sm:max-w-[1600px]",
      full: "max-w-[95vw]",
    };

    return sizeMap[width] || width;
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
        onClick: () => setInternalOpen(true),
      });
    }

    return (
      <Button
        variant={
          isEditing
            ? buttonVariant === "default"
              ? "icon"
              : buttonVariant
            : buttonVariant
        }
        size={
          isEditing
            ? buttonSize === "default"
              ? "md"
              : buttonSize
            : buttonSize
        }
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
        <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
      )}
      <DialogContent
        className={`${getModalWidthClass(
          modalWidth
        )} w-full max-w-full  max-h-[90vh]`}
      >
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
        <ScrollArea type="vertical" className="h-[calc(100vh-200px)]">
          <FormComponent data={entityData} onSuccess={handleSuccess} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}