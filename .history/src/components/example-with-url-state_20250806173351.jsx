"use client";

import { usePageState } from "@/hooks/use-page-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ExampleWithUrlState() {
  // Configurar el estado de la página
  const pageState = usePageState({
    defaultTab: "lista",
    defaultFilters: {
      search: "",
      category: "",
      status: "",
    },
    defaultPagination: { page: 1, pageSize: 10 },
    defaultSorting: { sortBy: "name", sortOrder: "asc" },
  });

  return (
    <div className="p-6">
      <h1>Ejemplo con Estado en URL</h1>

      {/* Las tabs mantienen su estado en la URL */}
      <Tabs value={pageState.activeTab} onValueChange={pageState.setActiveTab}>
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <div className="space-y-4">
            {/* Filtros que se mantienen en la URL */}
            <div className="flex gap-4">
              <Input
                placeholder="Buscar..."
                value={pageState.filters.search}
                onChange={(e) => pageState.setFilter("search", e.target.value)}
              />

              <Select
                value={pageState.filters.category}
                onValueChange={(value) =>
                  pageState.setFilter("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="cat1">Categoría 1</SelectItem>
                  <SelectItem value="cat2">Categoría 2</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={pageState.clearFilters}>Limpiar Filtros</Button>
            </div>

            {/* Contenido de la lista */}
            <div>
              <p>Página: {pageState.pagination.page}</p>
              <p>Filtros activos: {JSON.stringify(pageState.filters)}</p>
              <p>
                Ordenamiento: {pageState.sorting.sortBy} -{" "}
                {pageState.sorting.sortOrder}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grid">
          <p>Vista en grid - El estado se mantiene al cambiar de tab</p>
        </TabsContent>

        <TabsContent value="config">
          <p>Configuración - El estado se mantiene al recargar la página</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * URLs de ejemplo que se generarían:
 *
 * /asistencias?tab=consultar
 * /asistencias?tab=consultar&estudiante=estudiante1&curso=matematica&page=2
 * /asistencias?tab=reportes&fechaInicio=2025-01-01&fechaFin=2025-01-31
 */
