'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileDown,
  FileText,
  Loader2,
  Eye,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { generarPDFCertificado } from '@/action/documentos/certificadoActions';
import { generatePDFFromHTML, downloadPDF, openPDFInNewTab } from '@/utils/pdfUtils';

export default function GeneradorPDFCertificado({ certificado, onSuccess }) {
  const [generando, setGenerando] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfGenerado, setPdfGenerado] = useState(false);

  // Generar el PDF
  const generarPDF = async () => {
    try {
      setGenerando(true);
      setPdfGenerado(false);

      // Obtener el HTML del certificado desde el servidor
      const resultado = await generarPDFCertificado(certificado.id);

      if (resultado.error) {
        toast.error(resultado.error);
        return;
      }

      if (!resultado.success || !resultado.htmlContent) {
        toast.error('No se pudo obtener el contenido del certificado');
        return;
      }

      try {
        // Generar el PDF a partir del HTML
        const blob = await generatePDFFromHTML(
          resultado.htmlContent,
          `certificado-${certificado.codigo || certificado.id}.pdf`,
          { title: certificado.titulo || 'Certificado de Estudios' }
        );

        // Guardar el blob para uso posterior
        setPdfBlob(blob);
        setPdfGenerado(true);
      } catch (pdfError) {
        console.error('Error específico al generar PDF:', pdfError);
        
        // Verificar si es un error de color oklch
        if (pdfError.message && pdfError.message.includes('color')) {
          toast.error('Error al procesar los colores del certificado. Se ha aplicado una corrección automática, intente nuevamente.');
        } else {
          toast.error(`Error al generar el PDF: ${pdfError.message || 'Error desconocido'}`);
        }
        return;
      }

      // Notificar éxito
      toast.success('PDF generado correctamente');

      if (onSuccess) {
        onSuccess(blob);
      }

    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF: ' + (error.message || 'Error desconocido'));
    } finally {
      setGenerando(false);
    }
  };

  // Descargar el PDF generado
  const descargarPDF = () => {
    if (!pdfBlob) {
      toast.error('Primero debes generar el PDF');
      return;
    }

    downloadPDF(pdfBlob, `certificado-${certificado.codigo}.pdf`);
    toast.success('Descarga iniciada');
  };

  // Ver el PDF generado
  const verPDF = () => {
    if (!pdfBlob) {
      toast.error('Primero debes generar el PDF');
      return;
    }

    openPDFInNewTab(pdfBlob);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {/* Botón para generar PDF */}
        <Button
          variant={pdfGenerado ? "outline" : "default"}
          onClick={generarPDF}
          disabled={generando}
        >
          {generando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : pdfGenerado ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
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
        >
          <FileDown className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>

        {/* Botón para ver PDF */}
        <Button
          variant="outline"
          onClick={verPDF}
          disabled={!pdfGenerado || generando}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver PDF
        </Button>
      </div>

      {/* Mensaje de estado */}
      {generando && (
        <p className="text-sm text-gray-500 animate-pulse">
          Generando PDF, por favor espera...
        </p>
      )}

      {pdfGenerado && !generando && (
        <p className="text-sm text-green-600 flex items-center">
          <CheckCircle className="mr-1 h-3 w-3" />
          PDF listo para descargar o visualizar
        </p>
      )}
    </div>
  );
}
