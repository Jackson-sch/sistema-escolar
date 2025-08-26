'use client';

import { useState } from 'react';
import { verificarCertificado } from '@/action/documentos/certificadoActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Search, FileCheck, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatDate';

export default function VerificarCertificado() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  // Manejar verificación del certificado
  const handleVerificar = async (e) => {
    e.preventDefault();

    if (!codigo.trim()) {
      toast.error('Ingrese un código de verificación');
      return;
    }

    try {
      setLoading(true);
      setResultado(null);
      setError(null);

      const response = await verificarCertificado(codigo);

      if (response.error) {
        setError(response.error);
        toast.error(response.error);
        return;
      }

      if (response.success) {
        setResultado(response.certificado);
        toast.success('Certificado verificado correctamente');
      }
    } catch (error) {
      console.error('Error al verificar certificado:', error);
      setError('Error al verificar el certificado');
      toast.error('Error al verificar el certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileCheck className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Ingrese el código de verificación que aparece en el certificado para comprobar su autenticidad.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleVerificar} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Ingrese el código de verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Verificando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Verificar
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-6 p-4 border border-red-200 rounded-md bg-red-50">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {resultado && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-green-700">Certificado Verificado</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Código</p>
                  <p>{resultado.codigo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Título</p>
                  <p>{resultado.titulo}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Estudiante</p>
                <p className="text-sm font-semibold capitalize">{resultado.estudiante ? resultado.estudiante.name : 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Emisión</p>
                  <p className='capitalize'>{formatDate(resultado.fechaEmision, "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-none"
                  >
                    {resultado.estado}
                  </Badge>
                </div>
              </div>

              {resultado.archivoUrl && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => window.open(resultado.archivoUrl, '_blank')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Certificado
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
