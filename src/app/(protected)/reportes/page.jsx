import ReportesClient from "./ReportesClient";
import { auth } from "@/auth";

export const metadata = {
  title: "Reportes - Sistema Escolar",
  description: "Generación y consulta de reportes del sistema escolar",
};

export default async function ReportesPage() {
  // Obtener la sesión del usuario
  const session = await auth();
  const user = session.user;

  return <ReportesClient user={user} />;
}