"use client";

import GenericModal from "@/components/reutilizables/GenericModal";
import PersonalFormulario from "./formulario";

export default function ModalPersonal({
  administrativo,
  isOpen,
  onClose,
  institucionId,
}) {
  return (
    <GenericModal
      entityName="personal"
      entityData={administrativo}
      FormComponent={({ data, onSuccess }) => (
        <PersonalFormulario
          administrativoData={data}
          institucionId={institucionId}
          onSuccess={onSuccess}
        />
      )}
      modalWidth="sm:max-w-[625px]"
      labels={{
        create: "Nuevo",
        edit: "",
        createDescription: "Ingresa los datos del nuevo personal",
        editDescription: "Actualiza los datos del personal",
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
