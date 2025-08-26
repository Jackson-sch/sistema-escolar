"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useInstitucion } from "@/hooks/useInstitucion"
import ListaEventos from "./components/ListaEventos"
import MisEventos from "./components/MisEventos"
import FormularioEvento from "./components/FormularioEvento"
import DetalleEvento from "./components/DetalleEvento"
import { toast } from "sonner"
import { Plus, Calendar, User, Edit, Eye, Sparkles, TrendingUp, AlertTriangle, Calendar1 } from "lucide-react"

export default function EventosClient({ user }) {
  const [activeTab, setActiveTab] = useState('todos')
  const [selectedEvento, setSelectedEvento] = useState(null)
  const [editingEvento, setEditingEvento] = useState(null)
  const { institucion } = useInstitucion()

  const userId = user?.id

  if (!userId) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">Acceso requerido</h3>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Manejar cambio de pestaña
  const handleTabChange = (value) => {
    setActiveTab(value)
    if (value !== 'detalle') setSelectedEvento(null)
    if (value !== 'crear') setEditingEvento(null)
  }

  // Manejar acción de ver evento
  const handleVerEvento = (evento) => {
    setSelectedEvento(evento)
    setActiveTab('detalle')
  }

  // Manejar acción de editar evento
  const handleEditarEvento = (evento) => {
    setEditingEvento(evento)
    setActiveTab('crear')
  }

  // Manejar acción de crear evento
  const handleCrearEvento = () => {
    setEditingEvento(null)
    setActiveTab('crear')
  }

  // Manejar acción de volver
  const handleVolver = () => {
    if (activeTab === 'detalle') {
      setSelectedEvento(null)
      setActiveTab('todos')
    } else if (activeTab === 'crear' && editingEvento) {
      setEditingEvento(null)
      setActiveTab('mis-eventos')
    } else {
      setEditingEvento(null)
      setActiveTab('todos')
    }
  }

  // Manejar éxito en creación/edición
  const handleSuccess = (evento) => {
    if (editingEvento) {
      toast.success('✅ Evento actualizado correctamente')
      setActiveTab('mis-eventos')
    } else if (evento) {
      toast.success('🎉 Evento creado correctamente')
      setActiveTab('todos')
    } else {
      if (editingEvento) {
        setActiveTab('mis-eventos')
      } else {
        setActiveTab('todos')
      }
    }
    setEditingEvento(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6 animate-in fade-in-50 duration-500">
      {/* Header principal */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-muted-foreground" /> Eventos
            </h1>
            <p className="text-muted-foreground">
              Gestiona y organiza eventos académicos, culturales y administrativos
            </p>
          </div>
          <Button
            onClick={handleCrearEvento}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear evento
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Todos</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {activeTab === 'todos' ? '∞' : '—'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Mis eventos</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                    {activeTab === 'mis-eventos' ? '∞' : '—'}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">En curso</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">—</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Próximos</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">—</p>
                </div>
                <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="mis-eventos" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Mis eventos
          </TabsTrigger>
          <TabsTrigger
            value="crear"
            disabled={activeTab !== 'crear'}
            className="flex items-center gap-2"
          >
            {editingEvento ? (
              <>
                <Edit className="h-4 w-4" />
                Editar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Crear
              </>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="detalle"
            disabled={activeTab !== 'detalle'}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Detalle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <ListaEventos
            onVerEvento={handleVerEvento}
            onEditarEvento={handleEditarEvento}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="mis-eventos">
          <MisEventos
            userId={userId}
            onVerEvento={handleVerEvento}
            onEditarEvento={handleEditarEvento}
          />
        </TabsContent>

        <TabsContent value="crear">
          <FormularioEvento
            evento={editingEvento}
            userId={userId}
            onSuccess={handleSuccess}
          />
        </TabsContent>

        <TabsContent value="detalle">
          {selectedEvento && (
            <DetalleEvento
              eventoId={selectedEvento.id}
              onBack={handleVolver}
              onEdit={() => handleEditarEvento(selectedEvento)}
              isOrganizer={selectedEvento.organizadorId === user?.id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
