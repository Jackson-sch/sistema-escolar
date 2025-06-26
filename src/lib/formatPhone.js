export function formatPhone(phone) {
  if (!phone) return "-";
  return `+51 ${phone
    .replace(/\D+/g, "")
    .replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`;
}
