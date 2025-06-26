"use client";

import { useState, useCallback, memo } from "react";
import GenericModal from "@/components/reutilizables/GenericModal";
import { FormularioCurso } from "./FormularioCurso";

// Definir las etiquetas fuera del componente para evitar recreaciones
const labels = {
  create: "Registrar",
  edit: "Editar",
  createDescription: "Ingresa los datos del nuevo",
  editDescription: "Actualiza los datos del",
};

// Crear un componente memoizado para el formulario
const MemoizedFormularioCurso = memo(FormularioCurso);

function ModalCurso({ curso, isOpen: externalIsOpen, onClose: externalOnClose }) {
  // Estado interno para manejar el modal cuando se usa de forma independiente
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determinar si estamos siendo controlados externamente
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  
  // Manejar el cierre del modal
  const handleClose = useCallback(() => {
    if (isControlled && externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, externalOnClose]);
  
  // Memoizar la función del componente del formulario para evitar recreaciones
  const renderFormComponent = useCallback((props) => {
    return <MemoizedFormularioCurso {...props} cursoData={curso} />;
  }, [curso]);
  
  return (
    <GenericModal
      entityName="curso"
      entityData={curso}
      FormComponent={renderFormComponent}
      modalWidth="sm:max-w-[625px]"
      labels={labels}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}

export default memo(ModalCurso);
