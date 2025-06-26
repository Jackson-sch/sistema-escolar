import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Restringe la entrada a solo números y un máximo de caracteres.
 * @param {Event} e - Evento de input.
 * @param {number} maxLength - Máximo de caracteres permitidos.
 */
export function handleOnlyNumbers(e, maxLength) {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, maxLength);
}
