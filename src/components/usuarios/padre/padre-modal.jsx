import GenericModal from "@/components/reutilizables/GenericModal";
import { PadreRegistrationForm } from "@/components/usuarios/padre/formulario";

export default function PadreModal({ padre, isOpen, onClose }) {
  return (
    <GenericModal
      entityName="Padre/Tutor"
      entityData={padre}
      FormComponent={(props) => (
        <PadreRegistrationForm {...props} padreData={padre} />
      )}
      modalWidth="sm:max-w-[625px]"
      labels={{
        create: "Registrar",
        edit: "Editar",
        createDescription: "Ingresa los datos del nuevo",
        editDescription: "Actualiza los datos del",
      }}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
