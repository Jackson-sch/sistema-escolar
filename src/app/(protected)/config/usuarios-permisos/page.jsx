import { db } from "@/lib/db";
import { UsuariosPermisosClient } from "./usuarios-permisos-client";
import { getUsuarios } from "@/action/config/usuarios-action";
import { getPermisos } from "@/action/config/permisos-action";
import { getInstituciones } from "@/action/config/institucion-action";

export const metadata = {
  title: "Usuarios y Permisos | Sistema Escolar",
  description: "Gestión de usuarios y permisos del sistema escolar",
};

export default async function UsuariosPermisosPage() {
  const { data: instituciones = [] } = await getInstituciones();
  console.log("instituciones", instituciones)
  // Obtener la primera institución (esto podría cambiarse para permitir seleccionar la institución)
  const institucion = instituciones[0];


  // Si no hay institución, mostrar mensaje de error
  if (!institucion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No hay instituciones registradas</h1>
          <p className="text-muted-foreground mt-2">
            Debe registrar una institución antes de gestionar usuarios
          </p>
        </div>
      </div>
    );
  }

  // Obtener usuarios iniciales para la institución (excluyendo estudiantes y padres)
  const { data: usuarios = [] } = await getUsuarios(institucion.id, true); // El segundo parámetro true indica que solo queremos usuarios del sistema

  console.log("usuarios", usuarios)
  
  // Obtener permisos iniciales
  const { data: permisos = [] } = await getPermisos();

  return (
    <div className="container py-6">
      <UsuariosPermisosClient 
        institucion={institucion} 
        usuariosIniciales={usuarios}
        permisosIniciales={permisos}
      />
    </div>
  );
}
