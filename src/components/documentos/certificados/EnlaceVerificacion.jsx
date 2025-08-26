'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Link, 
  Copy, 
  ExternalLink, 
  QrCode,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export default function EnlaceVerificacion({ certificado }) {
  const [copiado, setCopiado] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrDataURL, setQrDataURL] = useState('');

  if (!certificado?.codigoVerificacion) {
    return null;
  }

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXTAUTH_URL || 'https://sistema-escolar.com';
  
  const enlaceVerificacion = `${baseUrl}/verificar-certificado?codigo=${certificado.codigoVerificacion}`;

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(enlaceVerificacion);
      setCopiado(true);
      toast.success('Enlace copiado al portapapeles');
      
      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('Error al copiar el enlace');
    }
  };

  const abrirEnlace = () => {
    window.open(enlaceVerificacion, '_blank');
  };

  const mostrarQR = async () => {
    if (!qrDataURL) {
      try {
        const dataURL = await QRCode.toDataURL(enlaceVerificacion, {
          width: 200,
          margin: 2,
          color: {
            dark: '#2c5aa0',
            light: '#FFFFFF'
          }
        });
        setQrDataURL(dataURL);
      } catch (error) {
        console.error('Error al generar QR:', error);
        toast.error('Error al generar código QR');
        return;
      }
    }
    setQrVisible(!qrVisible);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Link className="h-5 w-5" />
          Enlace de Verificación
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información del certificado */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Código:</span>
          <Badge variant="secondary" className="font-mono">
            {certificado.codigoVerificacion}
          </Badge>
        </div>

        {/* Campo de enlace */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Enlace de verificación pública:
          </label>
          <div className="flex gap-2">
            <Input
              value={enlaceVerificacion}
              readOnly
              className="font-mono text-xs bg-white"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copiarEnlace}
              title="Copiar enlace"
            >
              {copiado ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={abrirEnlace}
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={mostrarQR}
              title="Mostrar código QR"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Código QR */}
        {qrVisible && qrDataURL && (
          <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
            <img 
              src={qrDataURL} 
              alt="Código QR para verificación" 
              className="mx-auto"
            />
            <p className="text-xs text-gray-600">
              Escanee este código QR para verificar el certificado
            </p>
          </div>
        )}

        {/* Instrucciones */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
          <p className="font-medium mb-1">¿Cómo usar este enlace?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Comparta este enlace con quien necesite verificar el certificado</li>
            <li>El enlace abrirá directamente la página de verificación con el código precargado</li>
            <li>También puede usar el código QR para acceso rápido desde dispositivos móviles</li>
            <li>La verificación es pública y no requiere iniciar sesión</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
