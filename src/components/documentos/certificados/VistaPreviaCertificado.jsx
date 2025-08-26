'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  Hash,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import EnlaceVerificacion from './EnlaceVerificacion';
import { formatDate } from '@/lib/formatDate';
import GeneradorPDFCertificado from './GeneradorPDFCertificado';

export default function VistaPreviaCertificado({ certificado, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <CardTitle>Vista Previa del Certificado</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <GeneradorPDFCertificado 
              certificado={certificado} 
              onSuccess={() => toast.success('PDF generado correctamente')} 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del certificado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Código:</span>
                <Badge variant="secondary">{certificado.codigo}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Estudiante:</span>
                <span className="text-sm capitalize">
                  {certificado.estudiante?.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Fecha de emisión:</span>
                <span className="text-sm">{formatDate(certificado.fechaEmision)}</span>
              </div>
            </div>

            <div className="space-y-3">
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
                  <span className="text-sm">{formatDate(certificado.fechaExpiracion)}</span>
                </div>
              )}
              
              {certificado.firmado && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Certificado firmado</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Título y descripción */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-600">
              {certificado.titulo}
            </h3>
            
            {certificado.descripcion && (
              <p className="text-sm text-gray-600">
                {certificado.descripcion}
              </p>
            )}
          </div>

          <Separator />

          {/* Contenido del certificado */}
          <div className="space-y-3">
            <h4 className="font-medium">Contenido del Certificado:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {certificado.contenido}
              </p>
            </div>
          </div>

          {/* Datos adicionales */}
          {certificado.datosAdicionales && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Información Adicional:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(certificado.datosAdicionales, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* Código de verificación */}
          {certificado.codigoVerificacion && (
            <>
              <Separator />
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Código de Verificación:</p>
                <Badge variant="outline" className="font-mono text-lg px-4 py-2">
                  {certificado.codigoVerificacion}
                </Badge>
                <p className="text-xs text-gray-500">
                  Use este código para verificar la autenticidad del documento
                </p>
              </div>
            </>
          )}

          {/* Enlace de verificación */}
          {certificado.codigoVerificacion && (
            <>
              <Separator />
              <EnlaceVerificacion certificado={certificado} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
