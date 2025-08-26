"use client";

import * as React from "react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavAdmin } from "@/components/sidebar/nav-admin";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import navigationData from "./route";

// Función para obtener el rol del usuario
function getUserRole(user) {
  // Si no hay usuario, asumimos que es un invitado
  if (!user) return "invitado";

  // Devolvemos el rol del usuario (estudiante, profesor, administrativo, director, padre)
  return user.role || "estudiante";
}

export function AppSidebar({ user, ...props }) {
  // Determina el rol del usuario
  const role = getUserRole(user);

  // Filtra las rutas según el rol del usuario
  function filterNavByRole(navMain, role) {
    // El director tiene acceso a todo
    if (role === "director") return navMain;

    // Filtrado para administrativos
    if (role === "administrativo") {
      return navMain.filter(item =>
        !["Evaluaciones"].includes(item.title)
      );
    }

    // Filtrado para profesores
    if (role === "profesor") {
      return navMain.filter(item =>
        ["Dashboard", "Gestión Académica", "Evaluaciones", "Registro de Notas",
          "Asistencias", "Documentos", "Comunicaciones", "Reportes"].includes(item.title)
      );
    }

    // Filtrado para estudiantes
    if (role === "estudiante") {
      return navMain.filter(item =>
        ["Dashboard", "Registro de Notas", "Asistencias", "Documentos", "Comunicaciones"].includes(item.title)
      );
    }

    // Filtrado para padres
    if (role === "padre") {
      // Obtenemos los elementos de navegación básicos para padres
      const parentNav = navMain.filter(item =>
        ["Dashboard", "Registro de Notas", "Asistencias", "Gestión de Pagos", "Documentos", "Comunicaciones"].includes(item.title)
      );
      
      // Asegurarnos de que los padres tengan acceso a todas las funcionalidades de pagos
      // incluyendo la exportación de datos
      console.log("Configurando navegación para padres:", parentNav);
      console.log("Elementos disponibles:", navMain.map(item => item.title));
      
      return parentNav;
    }

    // Para invitados o roles no definidos, mostrar solo el dashboard
    return navMain.filter(item => item.title === "Dashboard");
  }

  // Filtra las rutas de administración según el rol
  function filterAdminByRole(adminConfig, role) {
    // Solo directores y administrativos pueden ver la configuración administrativa
    if (role === "director") return adminConfig;
    if (role === "administrativo") {
      return adminConfig.filter(item =>
        !["Configuración General"].includes(item.name)
      );
    }
    // Otros roles no tienen acceso a la configuración administrativa
    return [];
  }

  // Obtiene los elementos de navegación filtrados por rol
  const navItems = filterNavByRole(navigationData.navMain, role);
  const adminItems = filterAdminByRole(navigationData.adminConfig, role);

  // Determina si debe mostrar la sección de administración
  const showAdmin = adminItems.length > 0;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {showAdmin && <NavAdmin admin={adminItems} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
