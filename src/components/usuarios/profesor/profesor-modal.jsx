"use client";

import GenericModal from "@/components/reutilizables/GenericModal";
import ProfesorFormulario from "@/components/usuarios/profesor/formulario";

export default function ModalProfesor({ profesor, isOpen, onClose }) {
  return (
    <GenericModal
      entityName="profesor"
      entityData={profesor}
      FormComponent={(props) => (
        <ProfesorFormulario {...props} profesorData={profesor} />
      )}
      labels={{
        create: "Nuevo",
        edit: "Editar",
        createDescription: "Ingresa los datos del nuevo",
        editDescription: "Actualiza los datos del",
      }}
      modalWidth="sm:max-w-[625px]"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
