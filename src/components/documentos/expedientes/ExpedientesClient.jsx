'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListaExpedientes from './ListaExpedientes';
import FormularioExpediente from './FormularioExpediente';
import { useUser } from '@/context/UserContext';

export default function ExpedientesClient() {
  const session = useUser();
  const [activeTab, setActiveTab] = useState('consultar');
  const [expedienteEditar, setExpedienteEditar] = useState(null);

  // Función para manejar la edición de un expediente
  const handleEditar = (expediente) => {
    setExpedienteEditar(expediente);
    setActiveTab('registrar');
  };

  // Función para limpiar el expediente en edición
  const handleCancelarEdicion = () => {
    setExpedienteEditar(null);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Gestión de Expedientes</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="consultar">Consultar Expedientes</TabsTrigger>
          <TabsTrigger value="registrar">
            {expedienteEditar ? 'Editar Expediente' : 'Registrar Expediente'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expedientes Disponibles</CardTitle>
              <CardDescription>
                Consulta y administra los expedientes de estudiantes en la institución.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ListaExpedientes onEditar={handleEditar} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registrar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {expedienteEditar ? 'Editar Expediente' : 'Registrar Nuevo Expediente'}
              </CardTitle>
              <CardDescription>
                {expedienteEditar 
                  ? 'Modifica los datos del expediente seleccionado.'
                  : 'Completa el formulario para crear un nuevo expediente.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioExpediente 
                expediente={expedienteEditar}
                onSuccess={() => {
                  setExpedienteEditar(null);
                  setActiveTab('consultar');
                }}
                onCancel={handleCancelarEdicion}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
