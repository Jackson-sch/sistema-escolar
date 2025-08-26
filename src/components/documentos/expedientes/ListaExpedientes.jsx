'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Edit, Trash2, Eye, Download, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { obtenerExpedientes, eliminarExpediente } from '@/action/documento/documentoActions';
import VistaExpediente from './VistaExpediente';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserContext';

export default function ListaExpedientes({ onEditar }) {
  const session = useUser();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [expedienteEliminar, setExpedienteEliminar] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expedienteSeleccionado, setExpedienteSeleccionado] = useState(null);
  const [vistaPreviewOpen, setVistaPreviewOpen] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  // Cargar expedientes
  useEffect(() => {
    const cargarExpedientes = async () => {
      try {
        const result = await obtenerExpedientes();
        if (result.success) {
          setExpedientes(result.documentos || []);
        } else {
          toast('Error', {
            variant: 'destructive',
            description: result.error || 'No se pudieron cargar los expedientes',
          });
        }
      } catch (error) {
        console.error('Error al cargar expedientes:', error);
        toast('Error', {
          variant: 'destructive',
          description: 'No se pudieron cargar los expedientes. Intente nuevamente.',
        });
      } finally {
        setLoading(false);
      }
    };

    cargarExpedientes();
  }, [toast]);

  // Filtrar expedientes
  const expedientesFiltrados = expedientes.filter(
    (exp) =>
      exp.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      exp.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      exp.estudiante?.name?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Confirmar eliminación
  const confirmarEliminar = (expediente) => {
    setExpedienteEliminar(expediente);
    setConfirmOpen(true);
  };

  // Eliminar expediente
  const handleEliminar = async () => {
    if (!expedienteEliminar) return;
    
    try {
      const result = await eliminarExpediente(expedienteEliminar.id);
      if (result.success) {
        setExpedientes(expedientes.filter(exp => exp.id !== expedienteEliminar.id));
        toast('Expediente eliminado', {
          description: 'El expediente ha sido eliminado correctamente.',
        });
      } else {
        toast('Error', {
          variant: 'destructive',
          description: result.error || 'No se pudo eliminar el expediente',
        });
      }
    } catch (error) {
      console.error('Error al eliminar expediente:', error);
      toast('Error', {
        variant: 'destructive',
        description: 'No se pudo eliminar el expediente. Intente nuevamente.',
      });
    } finally {
      setExpedienteEliminar(null);
      setConfirmOpen(false);
    }
  };

  // Ver expediente
  const verExpediente = (expediente) => {
    setExpedienteSeleccionado(expediente);
    setVistaPreviewOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, código o estudiante..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 w-[250px] bg-muted/20"></div>
                  <div className="h-4 w-[200px] bg-muted/20"></div>
                </div>
                <div className="h-8 w-[100px] bg-muted/20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : expedientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No se encontraron expedientes</h3>
          <p className="text-muted-foreground mt-2">
            {filtro
              ? 'No hay expedientes que coincidan con tu búsqueda.'
              : 'Aún no se han registrado expedientes en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expedientesFiltrados.map((expediente) => (
                <TableRow key={expediente.id}>
                  <TableCell className="font-medium">{expediente.codigo}</TableCell>
                  <TableCell>{expediente.titulo}</TableCell>
                  <TableCell>{expediente.estudiante?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(expediente.fechaEmision), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={expediente.estado === 'activo' ? 'default' : 'secondary'}
                    >
                      {expediente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {expediente.archivoUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => verExpediente(expediente)}
                          title="Ver expediente"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {expediente.archivoUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(expediente.archivoUrl, '_blank')}
                          title="Descargar expediente"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditar(expediente)}
                        title="Editar expediente"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => confirmarEliminar(expediente)}
                        title="Eliminar expediente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el expediente "{expedienteEliminar?.titulo}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vista previa del expediente */}
      <VistaExpediente
        expediente={expedienteSeleccionado}
        isOpen={vistaPreviewOpen}
        onClose={() => setVistaPreviewOpen(false)}
      />
    </div>
  );
}
