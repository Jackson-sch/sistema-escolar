'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { generarVistaPreviaConstancia } from '@/action/documentos/constanciaActions';
import { formatDate } from '@/lib/formatDate';

export default function VistaPreviaConstancia({ constancia }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarVistaPrevia = async () => {
      if (!constancia?.id) return;
      
      setLoading(true);
      setError('');
      
      try {
        const resultado = await generarVistaPreviaConstancia(constancia.id);
        
        if (resultado.error) {
          setError(resultado.error);
        } else if (resultado.htmlContent) {
          setHtmlContent(resultado.htmlContent);
        } else {
          setError('No se pudo generar la vista previa');
        }
      } catch (err) {
        console.error('Error al generar vista previa:', err);
        setError('Error al generar la vista previa');
      } finally {
        setLoading(false);
      }
    };

    cargarVistaPrevia();
  }, [constancia]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Generando vista previa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border rounded-md bg-red-50 text-red-700">
        <p className="font-medium">Error al generar la vista previa</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!htmlContent) {
    return (
      <div className="p-6 text-center border rounded-md">
        <p>No hay contenido disponible para mostrar</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">{constancia.titulo}</h3>
          <p className="text-xs text-gray-500">
            Emitido: {formatDate(constancia.fechaEmision)}
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Código: {constancia.codigo || constancia.id}
        </div>
      </div>
      
      <div className="p-1 bg-white">
        <iframe
          srcDoc={htmlContent}
          title="Vista previa de constancia"
          className="w-full border-none"
          style={{ height: '600px', maxHeight: '60vh' }}
        />
      </div>
    </div>
  );
}
