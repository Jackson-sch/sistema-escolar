'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ListaCertificados from './ListaCertificados';
import FormularioCertificado from './FormularioCertificado';
import VerificarCertificado from './VerificarCertificado';
import { useUser } from '@/context/UserContext';

export default function CertificadosClient() {
  const session = useUser();
  const [activeTab, setActiveTab] = useState('consultar');
  const [certificadoEditar, setCertificadoEditar] = useState(null);

  // Función para manejar la edición de un certificado
  const handleEditar = (certificado) => {
    setCertificadoEditar(certificado);
    setActiveTab('registrar');
  };

  // Función para limpiar el certificado en edición
  const handleCancelarEdicion = () => {
    setCertificadoEditar(null);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Gestión de Certificados</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="consultar">Consultar Certificados</TabsTrigger>
          <TabsTrigger value="registrar">
            {certificadoEditar ? 'Editar Certificado' : 'Registrar Certificado'}
          </TabsTrigger>
          <TabsTrigger value="verificar">Verificar Certificado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificados Disponibles</CardTitle>
              <CardDescription>
                Consulta y administra los certificados emitidos en la institución.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ListaCertificados onEditar={handleEditar} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registrar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {certificadoEditar ? 'Editar Certificado' : 'Registrar Nuevo Certificado'}
              </CardTitle>
              <CardDescription>
                {certificadoEditar 
                  ? 'Modifica los datos del certificado seleccionado.'
                  : 'Completa el formulario para crear un nuevo certificado.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioCertificado 
                certificado={certificadoEditar}
                onSuccess={() => {
                  setCertificadoEditar(null);
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
                Verifica la autenticidad de un certificado mediante su código de verificación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificarCertificado />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
