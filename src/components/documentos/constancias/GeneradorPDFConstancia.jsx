'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileDown,
  FileText,
  Loader2,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { generarPDFConstancia } from '@/action/documentos/constanciaActions';
import { 
  generatePDFFromHTML, 
  downloadPDF, 
  openPDFInNewTab,
  esColorProblematico,
  convertirColorSeguro
} from '@/utils/pdfUtils';

export default function GeneradorPDFConstancia({ constancia, onSuccess }) {
  const [generando, setGenerando] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfGenerado, setPdfGenerado] = useState(false);
  const [error, setError] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [debugging, setDebugging] = useState(false);

  console.log("constancia desde el generador", constancia);

  // Función para validar la estructura de datos de la constancia
  const validarConstancia = (constancia) => {
    const errores = [];
    
    if (!constancia) {
      errores.push('Datos de constancia no disponibles');
    } else {
      if (!constancia.id) errores.push('ID de constancia faltante');
      if (!constancia.titulo) errores.push('Título de constancia faltante');
      if (!constancia.contenido) errores.push('Contenido de constancia faltante');
      if (!constancia.estudiante?.name) errores.push('Nombre del estudiante faltante');
      if (!constancia.emisor?.name) errores.push('Nombre del emisor faltante');
    }
    
    return errores;
  };

  // Función para limpiar HTML de colores problemáticos (versión simplificada)
  const limpiarHTMLSimple = (html) => {
    if (!html) return '';
    
    // Patrones más agresivos para eliminar colores problemáticos
    return html
      .replace(/oklch\([^)]+\)/gi, '#333333')
      .replace(/var\(--[^)]+\)/gi, '#333333')
      .replace(/hsl\([^)]+\)/gi, '#666666')
      .replace(/hsla\([^)]+\)/gi, '#666666')
      .replace(/color-mix\([^)]+\)/gi, '#333333')
      .replace(/light-dark\([^)]+\)/gi, '#333333')
      // Limpiar clases de Tailwind problemáticas
      .replace(/class="[^"]*oklch[^"]*"/gi, 'class=""')
      .replace(/class="[^"]*hsl[^"]*"/gi, 'class=""')
      // Asegurar fuentes web-safe
      .replace(/font-family:[^;]+;/gi, 'font-family: Arial, sans-serif;');
  };

  // Generar el PDF con manejo robusto de errores
  const generarPDF = async () => {
    try {
      setGenerando(true);
      setPdfGenerado(false);
      setError(null);
      setIntentos(prev => prev + 1);

      // Validar datos de constancia
      const erroresValidacion = validarConstancia(constancia);
      if (erroresValidacion.length > 0) {
        throw new Error(`Datos inválidos: ${erroresValidacion.join(', ')}`);
      }

      console.log(`Intento ${intentos + 1} - Iniciando generación de PDF para constancia:`, constancia.id);

      // Obtener el HTML de la constancia desde el servidor
      const resultado = await generarPDFConstancia(constancia.id);

      if (resultado.error) {
        throw new Error(resultado.error);
      }

      if (!resultado.success || !resultado.htmlContent) {
        throw new Error('No se pudo obtener el contenido de la constancia del servidor');
      }

      console.log('HTML obtenido del servidor, longitud:', resultado.htmlContent.length);

      // Limpiar HTML de forma agresiva
      const htmlLimpio = limpiarHTMLSimple(resultado.htmlContent);
      console.log('HTML limpiado, longitud:', htmlLimpio.length);

      // Verificar que el HTML limpio no tenga colores problemáticos
      const coloresProblematicos = [
        'oklch(',
        'var(--',
        'hsl(',
        'hsla(',
        'color-mix(',
        'light-dark('
      ];

      const tieneColoresProblematicos = coloresProblematicos.some(patron => 
        htmlLimpio.includes(patron)
      );

      if (tieneColoresProblematicos) {
        console.warn('HTML aún contiene colores problemáticos después de la limpieza');
        setDebugging(true);
      }

      // Generar el PDF
      console.log('Generando PDF...');
      const blob = await generatePDFFromHTML(
        htmlLimpio,
        `constancia-${constancia.codigo || constancia.id}.pdf`,
        { 
          title: constancia.titulo || 'Constancia de Estudios',
          format: 'A4',
          compress: true
        }
      );

      console.log('PDF generado exitosamente, tamaño:', blob.size, 'bytes');

      // Guardar el blob
      setPdfBlob(blob);
      setPdfGenerado(true);
      setError(null);
      setDebugging(false);
      
      toast.success('PDF generado correctamente');

      if (onSuccess) {
        onSuccess(blob);
      }

    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      let errorMessage = 'Error al generar el PDF';
      
      // Clasificar tipos de errores
      if (error.message.includes('color') || error.message.includes('oklch')) {
        errorMessage = 'Error de formato de colores. Intente nuevamente.';
      } else if (error.message.includes('canvas')) {
        errorMessage = 'Error al procesar el contenido. Verifique el HTML.';
      } else if (error.message.includes('font')) {
        errorMessage = 'Error al procesar fuentes. Usando fuentes por defecto.';
      } else if (error.message.includes('servidor')) {
        errorMessage = 'Error del servidor. Verifique la conexión.';
      } else if (error.message.includes('inválidos')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      
      // Activar modo debugging si hay errores persistentes
      if (intentos >= 2) {
        setDebugging(true);
      }
      
    } finally {
      setGenerando(false);
    }
  };

  // Descargar PDF
  const descargarPDF = () => {
    if (!pdfBlob) {
      toast.error('Primero debes generar el PDF');
      return;
    }

    try {
      downloadPDF(pdfBlob, `constancia-${constancia.codigo || constancia.id}.pdf`);
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar el PDF');
    }
  };

  // Ver PDF
  const verPDF = () => {
    if (!pdfBlob) {
      toast.error('Primero debes generar el PDF');
      return;
    }

    try {
      openPDFInNewTab(pdfBlob);
    } catch (error) {
      console.error('Error al abrir PDF:', error);
      toast.error('Error al abrir el PDF');
    }
  };

  // Reiniciar estado
  const reiniciarEstado = () => {
    setPdfBlob(null);
    setPdfGenerado(false);
    setError(null);
    setIntentos(0);
    setDebugging(false);
    toast.info('Estado reiniciado');
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex flex-wrap gap-2">
        {/* Botón para generar PDF */}
        <Button
          variant={pdfGenerado ? "outline" : "default"}
          onClick={generarPDF}
          disabled={generando}
          className="flex-1 min-w-[140px]"
        >
          {generando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : pdfGenerado ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar PDF
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generar PDF
            </>
          )}
        </Button>

        {/* Botón para descargar PDF */}
        <Button
          variant="outline"
          onClick={descargarPDF}
          disabled={!pdfGenerado || generando}
          className="flex-1 min-w-[120px]"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Descargar
        </Button>

        {/* Botón para ver PDF */}
        <Button
          variant="outline"
          onClick={verPDF}
          disabled={!pdfGenerado || generando}
          className="flex-1 min-w-[100px]"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver PDF
        </Button>

        {/* Botón para reiniciar */}
        {(error || intentos > 0) && (
          <Button
            variant="ghost"
            onClick={reiniciarEstado}
            disabled={generando}
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mensajes de estado */}
      {generando && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generando PDF, por favor espera...</span>
          {intentos > 1 && <span className="text-xs">(Intento {intentos})</span>}
        </div>
      )}

      {error && !generando && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {pdfGenerado && !generando && !error && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span>PDF listo para descargar o visualizar</span>
        </div>
      )}

      {/* Información de debugging */}
      {debugging && (
        <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded-lg">
          <p><strong>Información de debugging:</strong></p>
          <p>• Intentos realizados: {intentos}</p>
          <p>• Código constancia: {constancia.codigo || constancia.id}</p>
          <p>• Estudiante: {constancia.estudiante?.name || 'N/A'}</p>
          <p>• Emisor: {constancia.emisor?.name || 'N/A'}</p>
          <p>• Tipo: {constancia.tipo || 'N/A'}</p>
        </div>
      )}

      {/* Información básica */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Código:</span> {constancia.codigo || constancia.id}
          </div>
          <div>
            <span className="font-medium">Tipo:</span> {constancia.tipo || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Estudiante:</span> {constancia.estudiante?.name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Estado:</span> {constancia.estado || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}