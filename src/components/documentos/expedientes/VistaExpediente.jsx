'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, FileText, User, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function VistaExpediente({ expediente, isOpen, onClose }) {
  const [cargando, setCargando] = useState(false);

  if (!expediente) return null;

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return format(new Date(fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Obtener color según estado
  const getColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'archivado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const descargarArchivo = async () => {
    if (!expediente.archivoUrl) {
      toast('Error', {
        variant: 'destructive',
        description: 'Este expediente no tiene un archivo adjunto.',
      });
      return;
    }

    try {
      setCargando(true);
      
      // Si es una URL relativa, agregamos el origen
      let url = expediente.archivoUrl;
      if (url.startsWith('/')) {
        url = `${window.location.origin}${url}`;
      }
      
      // Abrir en nueva pestaña
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      toast('Error', {
        variant: 'destructive',
        description: 'No se pudo descargar el archivo. Intente nuevamente.',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {expediente.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Información básica */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info size={18} className="text-gray-500" />
              <h3 className="font-medium">Información del expediente</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Código:</span>
                <p className="font-medium">{expediente.codigo || 'No disponible'}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Estado:</span>
                <Badge className={getColorEstado(expediente.estado)}>
                  {expediente.estado || 'No definido'}
                </Badge>
              </div>
              
              <div className="col-span-2">
                <span className="text-gray-500">Descripción:</span>
                <p>{expediente.descripcion || 'Sin descripción'}</p>
              </div>
            </div>
          </div>

          {/* Información del estudiante */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-blue-500" />
              <h3 className="font-medium">Información del estudiante</h3>
            </div>
            
            <div className="text-sm">
              <p>
                <span className="text-gray-500">Estudiante:</span>{' '}
                <span className="font-medium">
                  {expediente.estudiante?.name || 'No asignado'}
                </span>
              </p>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-amber-500" />
              <h3 className="font-medium">Fechas</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Fecha de emisión:</span>
                <p>{formatearFecha(expediente.fechaEmision)}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Última actualización:</span>
                <p>{formatearFecha(expediente.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-gray-500" />
              <h3 className="font-medium">Contenido del expediente</h3>
            </div>
            
            <div className="text-sm mt-2 whitespace-pre-wrap bg-white p-3 border rounded-md max-h-40 overflow-y-auto">
              {expediente.contenido || 'Sin contenido'}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-4">
          <div>
            {expediente.archivoUrl && (
              <Button 
                variant="outline" 
                onClick={descargarArchivo}
                disabled={cargando}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {cargando ? 'Abriendo...' : 'Ver archivo'}
              </Button>
            )}
          </div>
          
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
