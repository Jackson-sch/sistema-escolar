"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearUsuario, actualizarUsuario } from "@/action/config/usuarios-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Importar los esquemas de validación
import { getSchemaByRole } from "./usuario-schemas";

// Importar componentes de formularios específicos
import { CamposComunesForm } from "./campos-comunes-form";
import { ProfesorForm } from "./profesor-form";
import { AdministrativoForm } from "./administrativo-form";
import { DirectorForm } from "./director-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UsuarioForm({ usuario = null, institucion, institucionId, onSuccess, onRoleSelect }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(usuario?.role || "profesor");
  
  // Obtener el esquema de validación según el rol seleccionado
  const schema = getSchemaByRole(selectedRole);
  
  // Preparar valores por defecto según el tipo de usuario
  const getDefaultValues = () => {
    const baseValues = {
      name: "",
      email: "",
      role: selectedRole,
      apellidoPaterno: "",
      apellidoMaterno: "",
      dni: "",
      fechaNacimiento: null,
      sexo: null,
      direccion: "",
      telefono: "",
      estado: "activo",
      password: "",
      confirmPassword: ""
    };
    
    // Valores específicos según el rol
    if (selectedRole === "profesor") {
      return {
        ...baseValues,
        especialidad: "",
        titulo: "",
        colegioProfesor: "",
        fechaContratacion: null,
        tipoContrato: null,
        escalaMagisterial: null
      };
    } else if (selectedRole === "administrativo") {
      return {
        ...baseValues,
        cargo: null,
        area: "",
        fechaIngreso: null,
        numeroContrato: ""
      };
    } else if (selectedRole === "director") {
      return {
        ...baseValues,
        cargo: "director",
        titulo: "",
        colegioProfesor: "",
        fechaContratacion: null,
        numeroResolucion: "",
        escalaMagisterial: null
      };
    }
    
    return baseValues;
  };
  
  // Mapear los valores del usuario existente al formulario
  const mapUserToFormValues = (user) => {
    const baseValues = {
      name: user.name || "",
      email: user.email || "",
      role: user.role || "profesor",
      apellidoPaterno: user.apellidoPaterno || "",
      apellidoMaterno: user.apellidoMaterno || "",
      dni: user.dni || "",
      fechaNacimiento: user.fechaNacimiento ? new Date(user.fechaNacimiento) : null,
      sexo: user.sexo || null,
      direccion: user.direccion || "",
      telefono: user.telefono || "",
      estado: user.estado || "activo",
      password: "",
      confirmPassword: ""
    };
    
    // Valores específicos según el rol
    if (user.role === "profesor") {
      return {
        ...baseValues,
        especialidad: user.especialidad || "",
        titulo: user.titulo || "",
        colegioProfesor: user.colegioProfesor || "",
        fechaContratacion: user.fechaContratacion ? new Date(user.fechaContratacion) : null,
        tipoContrato: user.tipoContrato || null,
        escalaMagisterial: user.escalaMagisterial || null
      };
    } else if (user.role === "administrativo") {
      return {
        ...baseValues,
        cargo: user.cargo || null,
        area: user.area || "",
        fechaIngreso: user.fechaIngreso ? new Date(user.fechaIngreso) : null,
        numeroContrato: user.numeroContrato || ""
      };
    } else if (user.role === "director") {
      return {
        ...baseValues,
        cargo: user.cargo || "director",
        titulo: user.titulo || "",
        colegioProfesor: user.colegioProfesor || "",
        fechaContratacion: user.fechaContratacion ? new Date(user.fechaContratacion) : null,
        numeroResolucion: user.numeroResolucion || "",
        escalaMagisterial: user.escalaMagisterial || null
      };
    }
    
    return baseValues;
  };

  // Configurar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: usuario ? mapUserToFormValues(usuario) : getDefaultValues()
  });
  
  // Actualizar el formulario cuando cambia el rol
  useEffect(() => {
    if (!usuario) {
      // Solo resetear el formulario si es un nuevo usuario
      form.reset(getDefaultValues());
    }
  }, [selectedRole, form]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    const instId = institucion?.id || institucionId;
    if (!instId) {
      toast.error("Error", {
        description: "No se ha seleccionado una institución",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Agregar el ID de la institución a los datos
      const usuarioData = {
        ...data,
        institucionId: instId
      };

      // Eliminar confirmPassword ya que no se guarda en la base de datos
      delete usuarioData.confirmPassword;

      // Si no hay contraseña (en caso de actualización), eliminarla del objeto
      if (!usuarioData.password) {
        delete usuarioData.password;
      }

      // Crear o actualizar el usuario
      const response = usuario
        ? await actualizarUsuario(usuario.id, usuarioData)
        : await crearUsuario(usuarioData);

      if (response.success) {
        toast.success(usuario ? "Usuario actualizado" : "Usuario creado", {
          description: usuario
            ? "El usuario ha sido actualizado correctamente"
            : "El usuario ha sido creado correctamente",
        });

        // Resetear el formulario si es una creación
        if (!usuario) {
          form.reset(getDefaultValues());
        }

        // Llamar al callback de éxito si existe
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        toast.error("Error", {
          description: response.error || "Ha ocurrido un error",
        });
      }
    } catch (error) {
      console.error("Error al procesar el usuario:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manejar cambio de rol
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    
    // Si hay una función onRoleSelect proporcionada, llamarla con el nuevo valor
    if (onRoleSelect && !usuario) {
      onRoleSelect(value);
    }
  };
  
  // Determinar si es un nuevo usuario o una edición
  const esNuevoUsuario = !usuario;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="h-[calc(100vh-200px)]">
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
            <CardDescription>
              Complete la información del usuario según su rol en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">

            
            {/* Campo de rol */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRoleChange(value);
                    }}
                    value={field.value}
                    disabled={!!usuario} // Deshabilitar cambio de rol en edición
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="profesor">Profesor</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El rol determina los permisos y funciones del usuario en el sistema.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Tabs defaultValue="datos-personales" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="datos-personales">Datos Personales</TabsTrigger>
                <TabsTrigger value="datos-especificos">Datos Específicos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="datos-personales" className="space-y-4 pt-4">
                {/* Componente de campos comunes */}
                <CamposComunesForm form={form} esNuevoUsuario={esNuevoUsuario} />
              </TabsContent>
              
              <TabsContent value="datos-especificos" className="space-y-4 pt-4">
                {/* Renderizar el formulario específico según el rol */}
                {selectedRole === "profesor" && <ProfesorForm form={form} />}
                {selectedRole === "administrativo" && <AdministrativoForm form={form} />}
                {selectedRole === "director" && <DirectorForm form={form} />}
              </TabsContent>
            </Tabs>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Botón de envío */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : usuario ? (
            "Actualizar Usuario"
          ) : (
            "Crear Usuario"
          )}
        </Button>
      </form>
    </Form>
  );
}
