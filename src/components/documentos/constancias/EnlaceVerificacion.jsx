'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export default function EnlaceVerificacion({ codigo, tipo = 'constancia' }) {
  const [copiado, setCopiado] = useState(false);
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    // Construir la URL de verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const verificacionUrl = `${baseUrl}/verificar-${tipo}?codigo=${codigo}`;
    setUrl(verificacionUrl);
    
    // Generar código QR
    const generarQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(verificacionUrl, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 200,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error al generar código QR:', error);
        toast.error('Error al generar el código QR');
      }
    };
    
    if (codigo) {
      generarQR();
    }
  }, [codigo, tipo]);

  // Copiar enlace al portapapeles
  const copiarEnlace = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopiado(true);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        toast.error('No se pudo copiar el enlace');
      });
  };

  // Compartir enlace (si el navegador lo soporta)
  const compartirEnlace = async () => {
    if (!navigator.share) {
      toast.error('Tu navegador no soporta la función de compartir');
      return;
    }

    try {
      await navigator.share({
        title: `Verificar ${tipo}`,
        text: `Verifica la autenticidad de esta ${tipo} usando el siguiente enlace:`,
        url: url,
      });
      toast.success('Enlace compartido correctamente');
    } catch (error) {
      console.error('Error al compartir:', error);
      if (error.name !== 'AbortError') {
        toast.error('Error al compartir el enlace');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white border rounded-lg">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Código QR de verificación" 
              width={200} 
              height={200} 
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100">
              <p className="text-sm text-gray-500">Generando QR...</p>
            </div>
          )}
        </div>
      </div>

      {/* Enlace de verificación */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Enlace de verificación:</label>
        <div className="flex gap-2">
          <Input value={url} readOnly className="flex-1" />
          <Button variant="outline" onClick={copiarEnlace}>
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          {navigator.share && (
            <Button variant="outline" onClick={compartirEnlace}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Código de verificación */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Código de verificación:</label>
        <div className="p-3 bg-gray-50 border rounded-md font-mono text-center">
          {codigo}
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        <p>
          Comparte este código QR o enlace para que cualquier persona pueda verificar la autenticidad de esta {tipo}.
        </p>
      </div>
    </div>
  );
}
