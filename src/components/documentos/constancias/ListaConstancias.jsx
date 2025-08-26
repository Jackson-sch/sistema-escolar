'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Pencil, 
  Trash2, 
  Eye, 
  Download, 
  Loader2, 
  Search, 
  FileCheck 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatDate';
import { 
  obtenerConstancias, 
  eliminarConstancia 
} from '@/action/documentos/constanciaActions';
import GeneradorPDFConstancia from './GeneradorPDFConstancia';
import VistaPreviaConstancia from './VistaPreviaConstancia';
import EnlaceVerificacion from './EnlaceVerificacion';

export default function ListaConstancias({ onEditar }) {
  const [constancias, setConstancias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [constanciaSeleccionada, setConstanciaSeleccionada] = useState(null);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);
  console.log("constancias", constancias)

  // Cargar constancias
  const cargarConstancias = async () => {
    setCargando(true);
    try {
      const resultado = await obtenerConstancias();
      console.log("resultado", resultado)
      if (resultado.error) {
        toast.error(resultado.error);
        setConstancias([]);
      } else {
        setConstancias(resultado.constancias || []);
      }
    } catch (error) {
      console.error('Error al cargar constancias:', error);
      toast.error('Error al cargar las constancias');
      setConstancias([]);
    } finally {
      setCargando(false);
    }
  };

  // Cargar constancias al montar el componente
  useEffect(() => {
    cargarConstancias();
  }, []);

  // Filtrar constancias según la búsqueda
  const constanciasFiltradas = constancias.filter(constancia => {
    const terminoBusqueda = busqueda.toLowerCase();
    return (
      constancia.titulo?.toLowerCase().includes(terminoBusqueda) ||
      constancia.estudiante?.name?.toLowerCase().includes(terminoBusqueda) ||
      constancia.codigo?.toLowerCase().includes(terminoBusqueda) ||
      constancia.tipo?.toLowerCase().includes(terminoBusqueda)
    );
  });

  // Eliminar una constancia
  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta constancia? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const resultado = await eliminarConstancia(id);
      if (resultado.error) {
        toast.error(resultado.error);
      } else {
        toast.success('Constancia eliminada correctamente');
        cargarConstancias();
      }
    } catch (error) {
      console.error('Error al eliminar constancia:', error);
      toast.error('Error al eliminar la constancia');
    }
  };

  // Mostrar vista previa de una constancia
  const handleVistaPrevia = (constancia) => {
    setConstanciaSeleccionada(constancia);
    setMostrarVistaPrevia(true);
  };

  // Mostrar enlace de verificación
  const handleMostrarVerificacion = (constancia) => {
    setConstanciaSeleccionada(constancia);
    setMostrarVerificacion(true);
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar constancias..."
          className="pl-8"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de constancias */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Estudiante</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Cargando constancias...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : constanciasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileText className="h-10 w-10 mb-2" />
                    <p>No se encontraron constancias</p>
                    {busqueda && (
                      <Button 
                        variant="link" 
                        onClick={() => setBusqueda('')}
                        className="mt-2"
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              constanciasFiltradas.map((constancia) => (
                <TableRow key={constancia.id}>
                  <TableCell className="font-medium">{constancia.titulo}</TableCell>
                  <TableCell>{constancia.estudiante?.name}</TableCell>
                  <TableCell>
                    {formatDate(constancia.fechaEmision)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={constancia.estado === 'ACTIVO' ? 'success' : 'secondary'}>
                      {constancia.estado || 'ACTIVO'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleVistaPrevia(constancia)}
                        title="Vista previa"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleMostrarVerificacion(constancia)}
                        title="Enlace de verificación"
                      >
                        <FileCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onEditar(constancia)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEliminar(constancia.id)}
                        title="Eliminar"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de vista previa */}
      <Dialog open={mostrarVistaPrevia} onOpenChange={setMostrarVistaPrevia}>
        <DialogContent className=" max-w-7xl sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista Previa de Constancia</DialogTitle>
            <DialogDescription>
              Previsualización de la constancia antes de generar el PDF
            </DialogDescription>
          </DialogHeader>
          {constanciaSeleccionada && (
            <div className="space-y-4">
              <VistaPreviaConstancia constancia={constanciaSeleccionada} />
              <div className="flex justify-end">
                <GeneradorPDFConstancia constancia={constanciaSeleccionada} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de enlace de verificación */}
      <Dialog open={mostrarVerificacion} onOpenChange={setMostrarVerificacion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificación de Constancia</DialogTitle>
            <DialogDescription>
              Comparte este enlace o código QR para verificar la autenticidad de la constancia
            </DialogDescription>
          </DialogHeader>
          {constanciaSeleccionada && (
            <EnlaceVerificacion 
              codigo={constanciaSeleccionada.codigoVerificacion || constanciaSeleccionada.id} 
              tipo="constancia"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
