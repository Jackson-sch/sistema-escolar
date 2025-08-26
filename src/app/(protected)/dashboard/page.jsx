import DashboardClient from "./DashboardClient";
import { auth } from "@/auth";

export const metadata = {
  title: "Dashboard - Sistema Escolar",
  description: "Panel principal del sistema escolar",
};

export default async function DashboardPage() {
  // Obtener la sesión del usuario
  const session = await auth();
  
  // Extraer información relevante del usuario para el dashboard
  const userInfo = {
    name: session?.user?.name || "Usuario",
    email: session?.user?.email,
    rol: session?.user?.role || "estudiante",
    id: session?.user?.id
  };

  return <DashboardClient userInfo={userInfo} />;
}