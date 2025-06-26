"use client";

import GenericModal from "@/components/reutilizables/GenericModal";
import { StudentRegistrationForm } from "@/components/usuarios/estudiante/formulario";
import { useInstitucion } from "@/hooks/use-institucion";

export default function ModalEstudiante({ estudiante, niveles, isOpen, onClose }) {
  const {info} = useInstitucion();
  
  return (
    <GenericModal
      entityName="estudiante"
      entityData={estudiante}
      FormComponent={(props) => (
        <StudentRegistrationForm {...props} userData={estudiante} institucionId={info.id} niveles={niveles} />
      )}
      modalWidth="sm:max-w-[625px]"
      labels={{
        create: "Nuevo",
        edit: "Editar",
        createDescription: "Ingresa los datos del nuevo",
        editDescription: "Actualiza los datos del",
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
