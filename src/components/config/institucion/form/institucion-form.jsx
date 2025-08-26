"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { createInstitucion, updateInstitucion } from "@/action/config/institucion-action";
import CamposGeneral from "@/components/config/institucion/form/CamposGeneral";
import CamposContacto from "@/components/config/institucion/form/CamposContacto";
import CamposAcademicos from "@/components/config/institucion/form/CamposAcademicos";
import CamposDocumentos from "@/components/config/institucion/form/CamposDocumentos";
import formSchema, { schemaSecciones } from "@/lib/validaciones/schemas/config/institucion-schema";

export function InstitucionForm({ institucion, seccion }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Determinar el esquema de validación según la sección
  const schema = seccion ? schemaSecciones[seccion] : formSchema;

  // Valores por defecto para el formulario
  const defaultValues = institucion
    ? {
      ...institucion,
      // Extraer solo los nombres de los niveles si existen
      niveles: institucion.niveles && Array.isArray(institucion.niveles)
        ? institucion.niveles.map(nivel => nivel.nombre)
        : [],
      // Asegurar que los campos de texto no sean null
      nombreComercial: institucion.nombreComercial || "",
      telefono: institucion.telefono || "",
      email: institucion.email || "",
      sitioWeb: institucion.sitioWeb || "",
      resolucionCreacion: institucion.resolucionCreacion || "",
      resolucionActual: institucion.resolucionActual || "",
      logo: institucion.logo || "",
      // Convertir fechas
      fechaCreacion: institucion.fechaCreacion ? new Date(institucion.fechaCreacion) : undefined,
      fechaInicioClases: institucion.fechaInicioClases ? new Date(institucion.fechaInicioClases) : undefined,
      fechaFinClases: institucion.fechaFinClases ? new Date(institucion.fechaFinClases) : undefined,
    }
    : {
      tipoGestion: "PUBLICA",
      modalidad: "PRESENCIAL",
      niveles: [],
      cicloEscolarActual: new Date().getFullYear(),
      fechaInicioClases: new Date(),
      fechaFinClases: new Date(),
      // Inicializar campos opcionales como cadenas vacías
      nombreComercial: "",
      telefono: "",
      email: "",
      sitioWeb: "",
      resolucionCreacion: "",
      resolucionActual: "",
      logo: ""
    };

  // Inicializar el formulario con el esquema y valores por defecto
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: seccion ?
      Object.keys(schema.shape).reduce((obj, key) => {
        // Asegurar que los campos de texto no sean null
        if (defaultValues[key] === null && typeof defaultValues[key] !== 'object') {
          obj[key] = "";
        } else {
          obj[key] = defaultValues[key];
        }
        return obj;
      }, {}) :
      defaultValues,
  });

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Limpiar datos para manejar campos opcionales vacíos
      const datosLimpios = {};

      // Procesar cada campo para manejar correctamente los valores vacíos
      Object.keys(data).forEach(key => {
        // Convertir strings vacías a null para campos opcionales
        if (data[key] === "") {
          datosLimpios[key] = null;
        } else {
          datosLimpios[key] = data[key];
        }
      });

      let result;

      if (institucion) {
        // Actualizar institución existente
        result = await updateInstitucion(institucion.id, datosLimpios);
      } else {
        // Crear nueva institución
        result = await createInstitucion(datosLimpios);
      }

      if (result.success) {
        toast.success(institucion ? "Institución actualizada correctamente" : "Institución creada correctamente");
        router.refresh();
      } else {
        toast.error(result.error || "Error al guardar los datos");
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar campos según la sección
  const renderCamposGeneral = () => (
    <CamposGeneral form={form} />
  );

  // Renderizar campos de contacto
  const renderCamposContacto = () => (
    <CamposContacto form={form} />
  );

  // Renderizar campos académicos
  const renderCamposAcademico = () => (
    <CamposAcademicos form={form} />
  );

  // Renderizar campos de documentos
  const renderCamposDocumentos = () => (
    <CamposDocumentos form={form} />
  );

  // Renderizar campos según la sección
  const renderCamposPorSeccion = () => {
    switch (seccion) {
      case "general":
        return renderCamposGeneral();
      case "contacto":
        return renderCamposContacto();
      case "academico":
        return renderCamposAcademico();
      case "documentos":
        return renderCamposDocumentos();
      default:
        return (
          <>
            {renderCamposGeneral()}
            {renderCamposContacto()}
            {renderCamposAcademico()}
            {renderCamposDocumentos()}
          </>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderCamposPorSeccion()}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : institucion ? "Actualizar" : "Crear Institución"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
