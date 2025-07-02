import React from "react";
import GenericModal from "@/components/reutilizables/GenericModal";
import FormularioMatricula from "./FormularioMatricula";

export default function ModalMatricula({ matricula, isOpen, onClose }) {
  return (
    <GenericModal
      entityName="matrícula"
      entityData={matricula}
      FormComponent={(props) => (
        <FormularioMatricula {...props} matriculaData={matricula} />
      )}
      modalWidth="sm:max-w-3xl"
      labels={{
        create: "Nueva",
        edit: "Editar",
        createDescription: "Ingresa los datos de la nueva",
        editDescription: "Actualiza los datos de la",
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
