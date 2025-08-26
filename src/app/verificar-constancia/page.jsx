import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { verificarConstancia } from '@/action/documentos/constanciaActions';
import { formatDate } from '@/lib/formatDate';

// Componente para mostrar el resultado de la verificación
function ResultadoVerificacion({ constancia, error }) {
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex items-start gap-3">
          <XCircle className="h-6 w-6 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-700">Error de verificación</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!constancia) return null;

  console.log('Constancia verificada:', constancia);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-2 pt-6 px-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <CardTitle className="text-green-700">Constancia Verificada</CardTitle>
            <CardDescription className="text-green-600">
              Esta constancia es auténtica y ha sido emitida por la institución
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Código</p>
              <p>{constancia.codigo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Título</p>
              <p>{constancia.titulo}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Estudiante</p>
            <p className="font-semibold capitalize">{constancia.estudiante ? constancia.estudiante.name : 'N/A'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Emisión</p>
              <p className="capitalize">{formatDate(constancia.fechaEmision, "PPP")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              <Badge variant={constancia.estado === 'ACTIVO' ? 'success' : 'secondary'}>
                {constancia.estado || 'ACTIVO'}
              </Badge>
            </div>
          </div>

          {constancia.fechaExpiracion && (
            <div>
              <p className="text-sm font-medium text-gray-500">Válido hasta</p>
              <p>{formatDate(constancia.fechaExpiracion, "PPP")}</p>
            </div>
          )}

          {constancia.institucion && (
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm font-medium text-gray-500">Institución Emisora</p>
              <p>{constancia.institucion.nombre}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para el formulario de verificación
function FormularioVerificacion({ searchParams }) {
  const codigo = searchParams?.codigo || '';

  return (
    <form action="/verificar-constancia" className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          name="codigo"
          placeholder="Ingrese el código de verificación"
          className="pl-8"
          defaultValue={codigo}
        />
      </div>
      <Button type="submit">Verificar</Button>
    </form>
  );
}

// Página principal de verificación
export default async function VerificarConstanciaPage({ searchParams }) {
  const codigo = searchParams?.codigo;
  let constancia = null;
  let error = null;

  if (codigo) {
    try {
      const resultado = await verificarConstancia(codigo);
      if (resultado.error) {
        error = resultado.error;
      } else {
        constancia = resultado.constancia;
      }
    } catch (err) {
      console.error('Error al verificar constancia:', err);
      error = 'Error al procesar la verificación';
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Verificación de Constancias</h1>
      <p className="text-gray-500 text-center mb-8">
        Verifique la autenticidad de una constancia emitida por nuestra institución
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Verificar Constancia</CardTitle>
          <CardDescription>
            Ingrese el código de verificación que aparece en la constancia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando...</div>}>
            <FormularioVerificacion searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>

      {(constancia || error) && (
        <Suspense fallback={<div>Verificando...</div>}>
          <ResultadoVerificacion constancia={constancia} error={error} />
        </Suspense>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <h2 className="font-medium text-base mb-2">¿Cómo verificar una constancia?</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Localice el código de verificación en la constancia impresa o digital</li>
          <li>Ingrese el código en el campo de texto arriba</li>
          <li>Haga clic en el botón "Verificar"</li>
          <li>El sistema mostrará si la constancia es auténtica y sus detalles</li>
        </ol>
      </div>
    </div>
  );
}
