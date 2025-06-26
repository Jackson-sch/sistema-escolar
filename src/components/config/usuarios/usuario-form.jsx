"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearUsuario, actualizarUsuario } from "@/action/config/usuarios-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Definir esquema de validación con Zod
const usuarioSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(["estudiante", "profesor", "administrativo", "director", "padre"]),
  apellidoPaterno: z.string().min(2, "El apellido paterno debe tener al menos 2 caracteres"),
  apellidoMaterno: z.string().min(2, "El apellido materno debe tener al menos 2 caracteres"),
  dni: z.string().min(8, "El DNI debe tener 8 dígitos").max(8, "El DNI debe tener 8 dígitos").optional().or(z.literal('')),
  estado: z.enum([
    "activo", "inactivo", "suspendido", "eliminado", "retirado", 
    "egresado", "licencia", "vacaciones", "trasladado", "graduado", 
    "condicional", "practicante", "jubilado", "expulsado"
  ]).default("activo"),
  cargo: z.enum([
    "administrador", "asistente", "auxiliar", "director", "secretaria",
    "contador", "coordinador", "mantenimiento", "subdirector", "coordinador_academico",
    "coordinador_tutoria", "psicologia", "enfermeria"
  ]).optional().nullable()
}).refine(data => {
  // Si se proporciona password, confirmPassword debe coincidir
  if (data.password && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
}).refine(data => {
  // Si es un nuevo usuario (no hay id), password es obligatorio
  if (!data.id && !data.password) {
    return false;
  }
  return true;
}, {
  message: "La contraseña es obligatoria para nuevos usuarios",
  path: ["password"]
});

export function UsuarioForm({ usuario = null, institucion, institucionId, onSuccess, onRoleSelect }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("institucion", institucionId)

  // Configurar el formulario con React Hook Form
  const form = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario ? {
      name: usuario.name || "",
      email: usuario.email || "",
      role: usuario.role || "estudiante",
      apellidoPaterno: usuario.apellidoPaterno || "",
      apellidoMaterno: usuario.apellidoMaterno || "",
      dni: usuario.dni || "",
      estado: usuario.estado || "activo",
      cargo: usuario.cargo || null,
      password: "",
      confirmPassword: ""
    } : {
      name: "",
      email: "",
      role: "estudiante",
      apellidoPaterno: "",
      apellidoMaterno: "",
      dni: "",
      estado: "activo",
      cargo: null,
      password: "",
      confirmPassword: ""
    }
  });

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
        institucionId: institucion?.id || institucionId
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
          form.reset();
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

  // Determinar si mostrar el campo de cargo basado en el rol
  const mostrarCargo = form.watch("role") === "administrativo" || form.watch("role") === "director";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Apellido Paterno */}
          <FormField
            control={form.control}
            name="apellidoPaterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Paterno</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido paterno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Apellido Materno */}
          <FormField
            control={form.control}
            name="apellidoMaterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido materno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DNI */}
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" maxLength={8} {...field} />
                </FormControl>
                <FormDescription>
                  Documento Nacional de Identidad (8 dígitos)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rol */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Si hay una función onRoleSelect proporcionada, llamarla con el nuevo valor
                    if (onRoleSelect && !usuario) {
                      onRoleSelect(value);
                    }
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="estudiante">Estudiante</SelectItem>
                    <SelectItem value="profesor">Profesor</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="padre">Padre/Tutor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Rol principal del usuario en el sistema
                  {!usuario && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Al seleccionar un rol específico se mostrará un formulario con campos adicionales para ese tipo de usuario.
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado */}
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                    <SelectItem value="licencia">En licencia</SelectItem>
                    <SelectItem value="vacaciones">En vacaciones</SelectItem>
                    <SelectItem value="retirado">Retirado</SelectItem>
                    <SelectItem value="egresado">Egresado</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Estado actual del usuario en el sistema
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cargo (solo para administrativos y directores) */}
          {mostrarCargo && (
            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="subdirector">Subdirector</SelectItem>
                      <SelectItem value="coordinador_academico">Coordinador Académico</SelectItem>
                      <SelectItem value="coordinador_tutoria">Coordinador de Tutoría</SelectItem>
                      <SelectItem value="secretaria">Secretaria</SelectItem>
                      <SelectItem value="contador">Contador</SelectItem>
                      <SelectItem value="asistente">Asistente</SelectItem>
                      <SelectItem value="auxiliar">Auxiliar</SelectItem>
                      <SelectItem value="psicologia">Psicología</SelectItem>
                      <SelectItem value="enfermeria">Enfermería</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="coordinador">Coordinador General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Cargo específico dentro de la institución
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Contraseña */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{usuario ? "Nueva Contraseña (opcional)" : "Contraseña"}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormDescription>
                  {usuario ? "Dejar en blanco para mantener la actual" : "Mínimo 6 caracteres"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirmar Contraseña */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {usuario ? "Actualizar usuario" : "Crear usuario"}
        </Button>
      </form>
    </Form>
  );
}
