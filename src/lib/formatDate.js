// Utilidad para formatear fechas de manera segura
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date) {
  if (!date) return "-";
  try {
    return format(new Date(date), "PPP", { locale: es });
  } catch (error) {
    return "-";
  }
}
