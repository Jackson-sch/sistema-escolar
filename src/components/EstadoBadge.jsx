export function EstadoBadge({ estado, colorClasses, estadosValidos }) {

  // Si el estado no está en estadosValidos, muestra un badge gris
  if (!estadosValidos.includes(estado)) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {estado}
      </span>
    );
  }
  
  // Usa el color personalizado o el color por defecto
  const color = colorClasses[estado] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}