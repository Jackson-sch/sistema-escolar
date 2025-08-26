// Utilidad para formatear fechas de manera segura
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date, formatString = "PPP", options = {}) {
  const {
    locale = es,
    fallback = "-"
  } = options;

  if (!date) return fallback;
  
  try {
    return format(new Date(date), formatString, { locale });
  } catch (error) {
    console.warn("Error al formatear fecha:", error);
    return fallback;
  }
}