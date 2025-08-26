'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListaConstancias from './ListaConstancias';
import FormularioConstancia from './FormularioConstancia';
import VerificarConstancia from './VerificarConstancia';
import { useUser } from '@/context/UserContext';

export default function ConstanciasClient() {
  const session = useUser();
  const [activeTab, setActiveTab] = useState('consultar');
  const [constanciaEditar, setConstanciaEditar] = useState(null);

  // Función para manejar la edición de una constancia
  const handleEditar = (constancia) => {
    setConstanciaEditar(constancia);
    setActiveTab('registrar');
  };

  // Función para limpiar la constancia en edición
  const handleCancelarEdicion = () => {
    setConstanciaEditar(null);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Gestión de Constancias</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="consultar">Consultar Constancias</TabsTrigger>
          <TabsTrigger value="registrar">
            {constanciaEditar ? 'Editar Constancia' : 'Registrar Constancia'}
          </TabsTrigger>
          <TabsTrigger value="verificar">Verificar Constancia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Constancias Disponibles</CardTitle>
              <CardDescription>
                Consulta y administra las constancias emitidas en la institución.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ListaConstancias onEditar={handleEditar} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registrar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {constanciaEditar ? 'Editar Constancia' : 'Registrar Nueva Constancia'}
              </CardTitle>
              <CardDescription>
                {constanciaEditar 
                  ? 'Modifica los datos de la constancia seleccionada.'
                  : 'Completa el formulario para crear una nueva constancia.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioConstancia 
                constancia={constanciaEditar}
                onSuccess={() => {
                  setConstanciaEditar(null);
                  setActiveTab('consultar');
                }}
                onCancel={handleCancelarEdicion}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verificar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Verificar Autenticidad</CardTitle>
              <CardDescription>
                Verifica la autenticidad de una constancia mediante su código de verificación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificarConstancia />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
