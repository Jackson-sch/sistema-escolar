'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  FileText,
  Calendar,
  User,
  Hash,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function VerificarCertificadoPage() {
  const searchParams = useSearchParams();
  const [codigo, setCodigo] = useState('');
  const [certificado, setCertificado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [error, setError] = useState('');
  console.log("certificado",certificado)

  // Obtener código de los parámetros de URL al cargar la página
  useEffect(() => {
    const codigoParam = searchParams.get('codigo');
    if (codigoParam) {
      setCodigo(codigoParam.toUpperCase());
      // Verificar automáticamente si viene código en la URL
      handleVerificarAutomatico(codigoParam.toUpperCase());
    }
  }, [searchParams]);

  const handleVerificarAutomatico = async (codigoVerificar) => {
    try {
      setLoading(true);
      setError('');
      setCertificado(null);
      setVerificado(false);

      const response = await fetch('/api/certificados/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo: codigoVerificar }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al verificar el certificado');
        return;
      }

      if (data.success) {
        setCertificado(data.certificado);
        setVerificado(true);
        toast.success('Certificado verificado correctamente');
      }

    } catch (error) {
      console.error('Error al verificar certificado:', error);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      toast.error('Por favor ingrese un código de verificación');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCertificado(null);
      setVerificado(false);

      const response = await fetch('/api/certificados/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo: codigo.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al verificar el certificado');
        return;
      }

      if (data.success) {
        setCertificado(data.certificado);
        setVerificado(true);
        toast.success('Certificado verificado correctamente');
      }

    } catch (error) {
      console.error('Error al verificar certificado:', error);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const limpiarFormulario = () => {
    setCodigo('');
    setCertificado(null);
    setVerificado(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificación de Certificados
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ingrese el código de verificación para validar la autenticidad de un certificado 
            emitido por nuestra institución educativa.
          </p>
        </div>

        {/* Formulario de verificación */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Verificar Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerificar} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Ingrese el código de verificación (ej: CERT-ABC123-XYZ789)"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  className="flex-1 font-mono"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !codigo.trim()}
                  className="px-8"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>
              
              {(certificado || error) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={limpiarFormulario}
                  className="w-full"
                >
                  Nueva Verificación
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Resultado de la verificación */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Certificado no encontrado</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {verificado && certificado && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="bg-green-100 border-b border-green-200 p-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-green-800">
                    Certificado Verificado ✓
                  </CardTitle>
                  <p className="text-sm text-green-600 mt-1">
                    Este certificado es auténtico y válido
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Código:</span>
                    <Badge variant="secondary" className="font-mono">
                      {certificado.codigo}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Estudiante:</span>
                    <span className="text-sm font-semibold capitalize">
                      {certificado.estudiante?.name}
                    </span>
                  </div>
                  
                  {certificado.estudiante?.dni && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">DNI:</span>
                      <span className="text-sm">{certificado.estudiante.dni}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Fecha de emisión:</span>
                    <span className="text-sm">{formatearFecha(certificado.fechaEmision)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge variant={certificado.estado === 'activo' ? 'default' : 'secondary'}>
                      {certificado.estado.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {certificado.fechaExpiracion && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Válido hasta:</span>
                      <span className="text-sm">{formatearFecha(certificado.fechaExpiracion)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Título y contenido */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-600">
                  {certificado.titulo}
                </h3>
                
                {certificado.descripcion && (
                  <p className="text-sm text-gray-600">
                    {certificado.descripcion}
                  </p>
                )}
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {certificado.contenido}
                  </p>
                </div>
              </div>

              {/* Información de emisión */}
              <Separator />
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">
                      Información de Verificación
                    </p>
                    <p className="text-blue-700">
                      Este certificado fue emitido por la Institución Educativa y ha sido 
                      verificado exitosamente. El código de verificación es único e intransferible.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Código de verificación: <span className="font-mono">{certificado.codigoVerificacion}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        <Card className="mt-8 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-800">¿Cómo verificar un certificado?</h3>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Cada certificado emitido por nuestra institución incluye un código de verificación único. 
                Ingrese este código en el campo superior para validar la autenticidad del documento.
              </p>
              <p className="text-xs text-gray-500">
                Si tiene problemas con la verificación, contacte a la institución educativa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
