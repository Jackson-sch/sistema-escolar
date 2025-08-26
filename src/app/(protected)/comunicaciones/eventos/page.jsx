import EventosClient from "./EventosClient";
import { auth } from "@/auth";

export const metadata = {
  title: "Eventos - Sistema Escolar",
  description: "Gestión de eventos y actividades de la institución",
};

export default async function EventosPage() {
  // Obtener la sesión del usuario
  const session = await auth()
  const user = session.user

  return <EventosClient user={user} />;
}
