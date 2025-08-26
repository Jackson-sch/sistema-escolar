import { redirect } from "next/navigation";

export default function ComunicacionesPage() {
  // Redirigir a la sección de anuncios por defecto
  redirect("/comunicaciones/anuncios");
}
