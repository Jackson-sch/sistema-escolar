import { useEffect, useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Search, User, X } from "lucide-react";
import { cn } from "@/utils/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function ComboBox({
  value,
  onChange,
  disabled = false,
  className,
  // Parámetros para hacer el componente genérico
  fetchData, // Función que retorna una promesa con los datos
  displayField = "name", // Campo a mostrar como principal
  valueField = "id", // Campo usado como valor seleccionado
  icon = <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />, // Icono personalizable
  placeholder = "Seleccionar", // Texto cuando no hay selección
  searchPlaceholder = "Buscar...", // Placeholder del campo de búsqueda
  searchFields = [], // Campos por los que se realizará la búsqueda
  secondaryField = null, // Campo secundario para mostrar junto al principal (opcional)
  secondaryFieldPrefix = "", // Prefijo para el campo secundario (ej: "DNI: ")
  emptyMessage = "No se encontraron resultados", // Mensaje cuando no hay resultados
  loadingMessage = "Cargando...", // Mensaje durante la carga
  errorMessage = "Error al cargar datos", // Mensaje de error
  renderItem = null, // Función para renderizar cada elemento de manera personalizada
  renderSelected = null, // Función para renderizar el elemento seleccionado
  noDataMessage = "No hay datos disponibles", // Mensaje cuando no hay datos
  width = "260px", // Ancho fijo del ComboBox
  allowClear = false, // Permitir limpiar la selección
}) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Fetch data
  useEffect(() => {
    if (!fetchData) return;

    setLoading(true);
    fetchData()
      .then((data) => {
        setItems(data || []);
        setError(null);
      })
      .catch((err) => {
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchData, errorMessage]);

  // Get selected item - versión mejorada con manejo estricto de tipos
  const selected = items.find((item) => {
    // Para valores nulos o undefined
    if (value === null || value === undefined || value === "") {
      return (
        item[valueField] === null ||
        item[valueField] === undefined ||
        item[valueField] === ""
      );
    }

    // Convertir ambos valores a string para comparación consistente
    return String(item[valueField]) === String(value);
  });

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [open]);

  // Clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  // Clear search text
  const handleClearSearch = (e) => {
    e.stopPropagation();
    setSearch("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Función de filtrado dinámica basada en los campos de búsqueda proporcionados
  const filteredItems = items.filter((item) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();

    // Si no se proporcionaron campos de búsqueda, usar el campo de visualización principal
    const fieldsToSearch =
      searchFields.length > 0 ? searchFields : [displayField];

    return fieldsToSearch.some((field) => {
      return (
        item[field] && String(item[field]).toLowerCase().includes(searchLower)
      );
    });
  });

  // Determinar si usar ancho fijo o ancho del trigger
  const useFixedWidth =
    width !== "100%" && !width.includes("%") && !width.includes("auto");

  // Estilo para aplicar un ancho fijo al ComboBox solo si no es porcentual
  const comboBoxStyle = useFixedWidth
    ? {
        width: width,
        maxWidth: width,
        minWidth: "160px",
        marginRight: "16px", // Asegurar separación consistente entre ComboBoxes
      }
    : {};

  return (
    <div className={cn("relative", className)} style={comboBoxStyle}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex items-center justify-between gap-2 border rounded-lg px-3 py-2 w-full truncate overflow-hidden focus:ring-2 focus:ring-primary/40 transition-all duration-150",
              selected ? "font-medium" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 truncate max-w-[calc(100%-24px)]">
              {icon}
              <div className="truncate">
                {selected ? selected[displayField] : placeholder}
                {secondaryField && selected && (
                  <span className="text-xs text-muted-foreground ml-1 block truncate">
                    {secondaryFieldPrefix}
                    {selected[secondaryField]}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center flex-shrink-0">
              {selected && !disabled && allowClear && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-destructive flex-shrink-0 cursor-pointer"
                  onClick={handleClear}
                  aria-label="Limpiar selección"
                />
              )}
              <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={
            useFixedWidth
              ? { width: width }
              : { width: "var(--radix-popover-trigger-width)" }
          }
          align="start"
          sideOffset={8}
        >
          <div className="flex items-center border-b px-3 relative">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-6"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-4 w-4 p-0 absolute right-3 hover:bg-muted rounded-full"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                {loadingMessage}
              </p>
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  if (!fetchData) return;

                  setLoading(true);
                  fetchData()
                    .then((data) => {
                      setItems(data || []);
                      setError(null);
                    })
                    .catch((err) => {
                      setError(errorMessage);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              >
                Reintentar
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">{noDataMessage}</p>
            </div>
          ) : (
            <Command>
              <CommandList>
                {filteredItems.length === 0 ? (
                  <CommandEmpty className="py-3 text-center text-sm">
                    {`${emptyMessage}${search ? ` para "${search}"` : ""}`}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={item[valueField]}
                        value={String(item[valueField])}
                        onSelect={() => {
                          onChange(item[valueField]);
                          setOpen(false);
                          setSearch(""); // Limpiar la búsqueda después de seleccionar
                        }}
                        className="py-2"
                      >
                        {renderItem ? (
                          renderItem(
                            item,
                            String(value) === String(item[valueField])
                          )
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col ">
                              <span className="font-medium capitalize truncate">
                                {item[displayField]}
                              </span>
                              {secondaryField && item[secondaryField] && (
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="truncate">
                                    {secondaryFieldPrefix}
                                    {item[secondaryField]}
                                  </span>
                                </div>
                              )}
                            </div>
                            {String(value) === String(item[valueField]) && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                            )}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
