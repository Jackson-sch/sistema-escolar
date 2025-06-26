import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Filter, Check } from "lucide-react";
import { niveles, gradosPorNivel } from "@/lib/gradosPorNivel";

// Función para obtener el nivel al que pertenece un grado
const obtenerNivelDeGrado = (grado) => {
  for (const [nivel, grados] of Object.entries(gradosPorNivel)) {
    if (grados.some((g) => g.value === grado.value || g === grado)) {
      return nivel;
    }
  }
  return null;
};

// Función para formatear el label de un grado incluyendo su nivel
const formatearGradoConNivel = (grado) => {
  if (typeof grado === "string") {
    return grado; // Si es solo un string, devolver tal cual
  }

  const nivel = obtenerNivelDeGrado(grado);
  if (!nivel) return grado.label || grado;

  const nivelFormateado = nivel.charAt(0) + nivel.slice(1).toLowerCase();
  return `${grado.label || grado} - ${nivelFormateado}`;
};

// Componente genérico de filtro
export function GenericFilter({
  column,
  options,
  placeholder = "Filtrar",
  icon = <MoreVertical />,
  mostrarNivel = false,
}) {
  const value = column.getFilterValue();
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{placeholder}</span>
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option) => {
          const isSelected =
            (option.value === "all" && value === null) ||
            option.value === value;

          // Determinar el label a mostrar
          let displayLabel = option.label;
          if (mostrarNivel && option.value !== "all") {
            displayLabel = formatearGradoConNivel(option);
          }

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() =>
                column.setFilterValue(
                  option.value === "all" ? null : option.value
                )
              }
              className="flex items-center justify-between py-1 px-2"
            >
              <span>{displayLabel}</span>
              {isSelected && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Filtro para niveles académicos usando las constantes importadas
export function NivelFilter({ column }) {
  // Crear opciones para el filtro incluyendo la opción "Todos"
  const nivelesOptions = [
    { value: "all", label: "Todos" },
    ...niveles.map((nivel) => ({
      value: nivel,
      label: nivel.charAt(0) + nivel.slice(1).toLowerCase(),
    })),
  ];

  return (
    <GenericFilter
      column={column}
      options={nivelesOptions}
      placeholder="Filtrar por nivel"
      icon={<Filter size={16} />}
    />
  );
}

// Filtro para grados usando las constantes importadas
export function GradoFilter({ column, nivelSeleccionado = null }) {
  // Obtener todos los grados de todos los niveles o solo del nivel seleccionado
  const obtenerGrados = () => {
    if (nivelSeleccionado && gradosPorNivel[nivelSeleccionado]) {
      return gradosPorNivel[nivelSeleccionado];
    }

    // Si no hay nivel seleccionado, combinar todos los grados
    const todosLosGrados = [];

    for (const [nivel, grados] of Object.entries(gradosPorNivel)) {
      // Para cada grado, agregamos la referencia al nivel correspondiente
      const gradosConNivel = grados.map((grado) => {
        // Si el grado ya es un objeto con value y label
        if (typeof grado === "object" && grado.value) {
          return { ...grado, nivel };
        }
        // Si el grado es solo un string
        return {
          value: grado,
          label: grado,
          nivel,
        };
      });

      todosLosGrados.push(...gradosConNivel);
    }

    return todosLosGrados;
  };

  const gradosOptions = [{ value: "all", label: "Todos" }, ...obtenerGrados()];

  return (
    <GenericFilter
      column={column}
      options={gradosOptions}
      placeholder="Filtrar por grado"
      icon={<Filter size={16} />}
      mostrarNivel={true}
    />
  );
}

// Filtro contextual que muestra grados según el nivel seleccionado
export function GradoFilterContextual({ column, nivelColumn }) {
  const nivelSeleccionado = nivelColumn.getFilterValue();

  // Obtener los grados correspondientes al nivel seleccionado
  const obtenerGradosFiltrados = () => {
    if (nivelSeleccionado && gradosPorNivel[nivelSeleccionado]) {
      // Si hay un nivel seleccionado, no necesitamos mostrar el nivel en cada grado
      return [
        { value: "all", label: "Todos" },
        ...gradosPorNivel[nivelSeleccionado].map((grado) => {
          if (typeof grado === "object" && grado.value) {
            return { ...grado, nivel: nivelSeleccionado };
          }
          return {
            value: grado,
            label: grado,
            nivel: nivelSeleccionado,
          };
        }),
      ];
    }

    // Si no hay nivel seleccionado, mostrar todos los grados con su nivel
    const todosLosGrados = [];

    for (const [nivel, grados] of Object.entries(gradosPorNivel)) {
      const gradosConNivel = grados.map((grado) => {
        if (typeof grado === "object" && grado.value) {
          return { ...grado, nivel };
        }
        return {
          value: grado,
          label: grado,
          nivel,
        };
      });

      todosLosGrados.push(...gradosConNivel);
    }

    return [{ value: "all", label: "Todos" }, ...todosLosGrados];
  };

  // Determinar si debemos mostrar el nivel en cada grado
  // Solo lo mostramos si no hay nivel seleccionado
  const mostrarNivel = !nivelSeleccionado;

  return (
    <GenericFilter
      column={column}
      options={obtenerGradosFiltrados()}
      placeholder="Filtrar por grado"
      icon={<Filter size={16} />}
      mostrarNivel={true}
    />
  );
}
