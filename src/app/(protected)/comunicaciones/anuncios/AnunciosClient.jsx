"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ListaAnuncios from "./components/ListaAnuncios";
import FormularioAnuncio from "./components/FormularioAnuncio";
import DetalleAnuncio from "./components/DetalleAnuncio";
import MisAnuncios from "./components/MisAnuncios";

export default function AnunciosClient({ user }) {
  const [activeTab, setActiveTab] = useState("todos");
  const [selectedAnuncio, setSelectedAnuncio] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Función para manejar la creación de un nuevo anuncio
  const handleCrearAnuncio = () => {
    setSelectedAnuncio(null);
    setIsCreating(true);
    setIsEditing(false);
    setActiveTab("crear");
  };

  // Función para manejar la edición de un anuncio
  const handleEditarAnuncio = (anuncio) => {
    setSelectedAnuncio(anuncio);
    setIsCreating(false);
    setIsEditing(true);
    setActiveTab("crear");
  };

  // Función para manejar la visualización de un anuncio
  const handleVerAnuncio = (anuncio) => {
    setSelectedAnuncio(anuncio);
    setIsCreating(false);
    setIsEditing(false);
    setActiveTab("detalle");
  };

  // Función para volver a la lista de anuncios
  const handleVolver = () => {
    setSelectedAnuncio(null);
    setIsCreating(false);
    setIsEditing(false);
    setActiveTab("todos");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Anuncios</h1>
        <Button onClick={handleCrearAnuncio}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Anuncio
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="todos">Todos los Anuncios</TabsTrigger>
          <TabsTrigger value="mis-anuncios">Mis Anuncios</TabsTrigger>
          <TabsTrigger value="crear" disabled={!isCreating && !isEditing}>
            {isCreating ? "Crear Anuncio" : isEditing ? "Editar Anuncio" : "Crear/Editar"}
          </TabsTrigger>
          <TabsTrigger value="detalle" disabled={!selectedAnuncio || isCreating || isEditing}>
            Detalle del Anuncio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <ListaAnuncios 
            onVerAnuncio={handleVerAnuncio} 
            onEditarAnuncio={handleEditarAnuncio} 
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="mis-anuncios" className="space-y-4">
          <MisAnuncios 
            userId={user?.id} 
            onVerAnuncio={handleVerAnuncio} 
            onEditarAnuncio={handleEditarAnuncio} 
          />
        </TabsContent>

        <TabsContent value="crear" className="space-y-4">
          <FormularioAnuncio 
            anuncio={selectedAnuncio} 
            isEditing={isEditing} 
            onVolver={handleVolver} 
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="detalle" className="space-y-4">
          {selectedAnuncio && (
            <DetalleAnuncio 
              anuncioId={selectedAnuncio.id} 
              onVolver={handleVolver} 
              onEditar={() => handleEditarAnuncio(selectedAnuncio)}
              userId={user?.id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
