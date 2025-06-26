"use client";

import GenericModal from "@/components/reutilizables/GenericModal";
import AdministrativoFormulario from "@/components/administrativo/formulario";

export default function ModalAdministrativo({
  administrativo,
  isOpen,
  onClose,
}) {
  return (
    <GenericModal
      entityName="administrativo"
      entityData={administrativo}
      FormComponent={(props) => (
        <AdministrativoFormulario
          {...props}
          administrativoData={administrativo}
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
