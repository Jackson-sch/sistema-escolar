"use client";

import NivelAcademicoForm from "@/components/academico/niveles/formulario";
import GenericModal from "@/components/reutilizables/GenericModal";

export default function NivelAcademicoModal({ nivelAcademicoData = null }) {
  return (
    <GenericModal
      entityName="nivel académico"
      entityData={nivelAcademicoData}
      FormComponent={(props) => (
        <NivelAcademicoForm
          {...props}
          nivelAcademicoData={nivelAcademicoData}
        />
      )}
      labels={{
        create: "Nuevo",
        edit: "",
        createDescription: "Ingresa los datos del nuevo",
        editDescription: "Actualiza los datos del",
      }}
    />
  );
}
