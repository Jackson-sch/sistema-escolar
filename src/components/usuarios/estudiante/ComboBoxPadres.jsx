import React from "react";

import { getPadres } from "@/action/padre/padre";
import { useEffect, useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";


// Memoizar el componente para evitar renderizados innecesarios
export default React.memo(function ComboBoxPadres({
  value = "", // Proporcionar un valor por defecto para evitar null
  onChange,
  disabled = false,
  className,
}) {
  const [padres, setPadres] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Fetch parents data
  useEffect(() => {
    setLoading(true);
    getPadres()
      .then((data) => {
        setPadres(data || []);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching padres:", err);
        setError("Error al cargar datos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Get selected parent - manejo seguro de valores nulos o undefined
  const selected = padres.find((p) => p.id === value) || null;

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

  // Función de filtrado corregida para que funcione correctamente
  const filteredPadres = padres.filter((padre) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    return (
      (padre.name && padre.name.toLowerCase().includes(searchLower)) ||
      (padre.dni && padre.dni.toLowerCase().includes(searchLower)) ||
      (padre.email && padre.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left font-normal",
              !selected && "text-muted-foreground"
            )}
            onClick={() => setOpen(!open)}
          >
            {selected ? (
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate capitalize">
                  {selected.name}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({selected.dni || "Sin DNI"})
                  </span>
                </span>
              </div>
            ) : (
              <span>Seleccionar padre/tutor</span>
            )}
            <div className="flex gap-1">
              {/* {selected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-4 w-4 p-0 hover:bg-muted rounded-full"
                  aria-label="Limpiar selección"
                >
                  <X className="h-3 w-3" />
                </Button>
              )} */}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          style={{ width: "var(--radix-popover-trigger-width)" }}
          align="start"
          sideOffset={8}
        >
          <div className="flex items-center border-b px-3 relative">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              placeholder="Buscar por nombre, DNI o email..."
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
              <p className="text-sm text-muted-foreground mt-2">Cargando...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setLoading(true);
                  getPadres()
                    .then((data) => {
                      setPadres(data || []);
                      setError(null);
                    })
                    .catch((err) => {
                      setError("Error al cargar datos");
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <Command>
              <CommandList>
                {filteredPadres.length === 0 ? (
                  <CommandEmpty className="py-3 text-center text-sm">
                    No se encontraron resultados para "{search}"
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredPadres.map((padre) => (
                      <CommandItem
                        key={padre.id}
                        value={padre.id || ""}
                        onSelect={() => {
                          // Asegurar que nunca se pase un valor nulo o undefined
                          onChange(padre.id || "");
                          setOpen(false);
                          setSearch("");
                        }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium capitalize">
                              {padre.name}
                            </span>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {padre.dni && <span>DNI: {padre.dni}</span>}
                              {padre.email && (
                                <span className="hidden md:inline-block truncate max-w-[120px]">
                                  {padre.email}
                                </span>
                              )}
                            </div>
                          </div>
                          {padre.id === value && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
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
});

