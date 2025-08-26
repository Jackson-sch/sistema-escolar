import AnunciosClient from "./AnunciosClient";
import { auth } from "@/auth";

export const metadata = {
  title: "Anuncios - Sistema Escolar",
  description: "Gestión de anuncios y comunicaciones importantes de la institución",
};

export default async function AnunciosPage() {
  // Obtener la sesión del usuario
  const session = await auth()
  const user = session.user

  return <AnunciosClient user={user} />;
}
