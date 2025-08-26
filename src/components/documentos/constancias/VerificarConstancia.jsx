'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatDate';
import { CheckCircle, XCircle, Search, FileCheck, Download } from 'lucide-react';
import { verificarConstancia } from '@/action/documentos/constanciaActions';

export default function VerificarConstancia() {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState('');

  const handleVerificar = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setError('Ingrese un código de verificación');
      return;
    }

    setVerificando(true);
    setError('');
    setResultado(null);

    try {
      const respuesta = await verificarConstancia(codigo.trim());
      
      if (respuesta.error) {
        setError(respuesta.error);
      } else if (respuesta.constancia) {
        setResultado(respuesta.constancia);
      } else {
        setError('No se pudo verificar la constancia');
      }
    } catch (err) {
      console.error('Error al verificar constancia:', err);
      setError('Error al verificar la constancia');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleVerificar} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Ingrese el código de verificación"
            className="pl-8"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={verificando}>
          {verificando ? 'Verificando...' : 'Verificar'}
        </Button>
      </form>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-700">Error de verificación</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {resultado && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-medium text-green-700">Constancia Verificada</h3>
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
                  <p className="capitalize">{formatDate(resultado.fechaEmision, "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <Badge variant={resultado.estado === 'ACTIVO' ? 'success' : 'secondary'}>
                    {resultado.estado || 'ACTIVO'}
                  </Badge>
                </div>
              </div>

              {resultado.fechaExpiracion && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Válido hasta</p>
                  <p>{formatDate(resultado.fechaExpiracion, "PPP")}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    Esta constancia es auténtica y ha sido emitida por la institución
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <p>
          <strong>¿Cómo verificar una constancia?</strong>
        </p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Ingrese el código de verificación que aparece en la constancia</li>
          <li>Haga clic en el botón "Verificar"</li>
          <li>El sistema mostrará si la constancia es auténtica y sus detalles</li>
        </ol>
      </div>
    </div>
  );
}
