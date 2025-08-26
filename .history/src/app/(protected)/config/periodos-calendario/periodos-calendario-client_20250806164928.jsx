"use client";

import { useState } from "react";
import { PeriodoForm } from "@/components/config/periodos/periodo-form";
import { PeriodoList } from "@/components/config/periodos/periodo-list";
import { getPeriodos } from "@/action/config/periodo-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, CalendarRange, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function PeriodosCalendarioClient({
  institucion,
  periodos: initialPeriodos,
  successPeriodos,
  errorPeriodos,
}) {
  const [periodos, setPeriodos] = useState(initialPeriodos || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [periodoToEdit, setPeriodoToEdit] = useState(null);
  console.log("institucion", institucion);
  // Función para refrescar la lista de períodos
  const refreshPeriodos = async () => {
    if (!institucion?.id) return;

    setIsLoading(true);
    try {
      const response = await getPeriodos(institucion.id);
      if (response.success) {
        setPeriodos(response.data);
      } else {
        toast.error("Error", {
          description:
            response.error || "No se pudieron cargar los períodos académicos",
        });
      }
    } catch (error) {
      console.error("Error al refrescar períodos:", error);
      toast.error("Error", {
        description: "Ha ocurrido un error al cargar los períodos académicos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para abrir el diálogo de edición
  const handleEdit = (periodo) => {
    setPeriodoToEdit(periodo);
    setIsDialogOpen(true);
  };

  // Función para cerrar el diálogo y limpiar el estado
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Esperar a que se cierre el diálogo antes de limpiar el estado
    setTimeout(() => {
      setPeriodoToEdit(null);
    }, 300);
  };

  // Función que se ejecuta después de crear o editar un período
  const handleSuccess = () => {
    refreshPeriodos();
    handleCloseDialog();
  };

  // Filtrar períodos por año escolar (para la vista de pestañas)
  const getAniosEscolares = () => {
    const anios = [...new Set(periodos.map((p) => p.anioEscolar))];
    return anios.sort((a, b) => b - a); // Ordenar de más reciente a más antiguo
  };

  const aniosEscolares = getAniosEscolares();
  const anioActual = new Date().getFullYear();
  const defaultTab = aniosEscolares.includes(anioActual)
    ? anioActual.toString()
    : aniosEscolares.length > 0
    ? aniosEscolares[0].toString()
    : "todos";

  return (
    <>
      <div className="space-y-6">
        {/* Sección de períodos académicos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarRange className="h-5 w-5" />
                Períodos Académicos
              </CardTitle>
              <CardDescription>
                Configura los períodos académicos para el año escolar
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={refreshPeriodos}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Período
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!successPeriodos && (
              <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">
                  {errorPeriodos || "Error al cargar los períodos académicos"}
                </p>
              </div>
            )}

            {successPeriodos && aniosEscolares.length > 0 ? (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  {aniosEscolares.map((anio) => (
                    <TabsTrigger key={anio} value={anio.toString()}>
                      {anio}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="todos">
                  <PeriodoList
                    periodos={periodos}
                    onEdit={handleEdit}
                    onRefresh={refreshPeriodos}
                  />
                </TabsContent>

                {aniosEscolares.map((anio) => (
                  <TabsContent key={anio} value={anio.toString()}>
                    <PeriodoList
                      periodos={periodos.filter((p) => p.anioEscolar === anio)}
                      onEdit={handleEdit}
                      onRefresh={refreshPeriodos}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  No hay períodos académicos configurados
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer período
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de calendario escolar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Calendario Escolar</CardTitle>
            <CardDescription>
              Visualiza y gestiona el calendario escolar completo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarioEscolar periodos={periodos} />
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para crear/editar períodos */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {periodoToEdit
                ? "Editar período académico"
                : "Crear período académico"}
            </DialogTitle>
            <DialogDescription>
              {periodoToEdit
                ? "Modifica los detalles del período académico seleccionado"
                : "Completa el formulario para crear un nuevo período académico"}
            </DialogDescription>
          </DialogHeader>
          <PeriodoForm
            institucion={institucion}
            periodo={periodoToEdit}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
