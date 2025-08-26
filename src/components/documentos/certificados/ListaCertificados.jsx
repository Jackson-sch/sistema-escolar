'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  obtenerCertificados,
  eliminarCertificado,
  generarPDFCertificado
} from '@/action/documentos/certificadoActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import VistaPreviaCertificado from './VistaPreviaCertificado';
import {
  FileText,
  Pencil,
  Trash2,
  Download,
  Search,
  FileCheck,
  FilePlus2,
  Eye
} from 'lucide-react';

export default function ListaCertificados({ onEditar }) {
  const { data: session } = useSession();
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '', estado: '', estudianteId: '' });
  const [certificadoEliminar, setCertificadoEliminar] = useState(null);
  const [certificadoVistaPrevia, setCertificadoVistaPrevia] = useState(null);

  console.log("certificados", certificados)
  // Cargar certificados
  const loadCertificados = async () => {
    try {
      setLoading(true);
      const { certificados, pagination: paginationData, error } = await obtenerCertificados({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (error) {
        toast.error(error);
        return;
      }

      setCertificados(certificados || []);
      setPagination(paginationData || pagination);
    } catch (error) {
      console.error('Error al cargar certificados:', error);
      toast.error('Error al cargar los certificados');
    } finally {
      setLoading(false);
    }
  };

  // Cargar certificados al montar el componente o cambiar filtros/paginación
  useEffect(() => {
    loadCertificados();
  }, [pagination.page, pagination.limit, filters]);

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 }); // Resetear a primera página
  };

  // Manejar eliminación de certificado
  const handleEliminar = async () => {
    if (!certificadoEliminar) return;

    try {
      const { success, error } = await eliminarCertificado(certificadoEliminar.id);

      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success('Certificado eliminado correctamente');
        loadCertificados();
      }
    } catch (error) {
      console.error('Error al eliminar certificado:', error);
      toast.error('Error al eliminar el certificado');
    } finally {
      setCertificadoEliminar(null);
    }
  };

  // Generar PDF del certificado
  const handleGenerarPDF = async (id) => {
    try {
      const { success, error, archivoUrl } = await generarPDFCertificado(id);

      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success('PDF generado correctamente');
        // Aquí podríamos abrir el PDF en una nueva pestaña
        window.open(archivoUrl, '_blank');
        loadCertificados();
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  // Renderizar estado con color
  const renderEstado = (estado) => {
    const estados = {
      'activo': { color: 'bg-green-100 text-green-800', label: 'Activo' },
      'inactivo': { color: 'bg-gray-100 text-gray-800', label: 'Inactivo' },
      'borrador': { color: 'bg-yellow-100 text-yellow-800', label: 'Borrador' },
    };

    const estadoInfo = estados[estado] || { color: 'bg-blue-100 text-blue-800', label: estado };

    return (
      <Badge variant="outline" className={`${estadoInfo.color} border-none`}>
        {estadoInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar por título o código..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
            icon={Search}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            value={filters.estado || 'todos'}
            onValueChange={(value) => handleFilterChange('estado', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setFilters({ search: '', estado: '', estudianteId: '' })}
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Tabla de certificados */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : certificados.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No hay certificados disponibles</h3>
          <p className="mt-1 text-gray-500">
            No se encontraron certificados con los filtros aplicados.
          </p>
          <Button
            className="mt-4"
            onClick={() => onEditar(null)}
          >
            <FilePlus2 className="mr-2 h-4 w-4" />
            Crear nuevo certificado
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificados.map((certificado) => (
                  <TableRow key={certificado.id}>
                    <TableCell className="font-medium">{certificado.codigo}</TableCell>
                    <TableCell>{certificado.titulo}</TableCell>
                    <TableCell className="capitalize">
                      {certificado.estudiante ? `${certificado.estudiante.name}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(certificado.fechaEmision).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>{renderEstado(certificado.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCertificadoVistaPrevia(certificado)}
                          title="Vista Previa"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerarPDF(certificado.id)}
                          title="Generar PDF"
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                        {certificado.archivoUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(certificado.archivoUrl, '_blank')}
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditar(certificado)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCertificadoEliminar(certificado)}
                          title="Eliminar"
                          className="text-destructive"
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

          {/* Paginación */}
          {pagination.pages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page =>
                    // Mostrar primera, última y páginas cercanas a la actual
                    page === 1 ||
                    page === pagination.pages ||
                    Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, array) => {
                    // Agregar elipsis si hay saltos
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === pagination.page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!certificadoEliminar} onOpenChange={() => setCertificadoEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el certificado
              <span className="font-semibold"> {certificadoEliminar?.codigo}</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vista previa del certificado */}
      {certificadoVistaPrevia && (
        <VistaPreviaCertificado
          certificado={certificadoVistaPrevia}
          onClose={() => setCertificadoVistaPrevia(null)}
        />
      )}
    </div>
  );
}
