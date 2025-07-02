import { getInstituciones } from "@/action/config/institucion-action";
import { getUsuarios } from "@/action/config/usuarios-action";
import { InstitucionForm } from "@/components/config/institucion/institucion-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Calendar, GraduationCap, MapPin, Mail, User, MapIcon, Building2, Clock, AlertTriangle, CheckCircle, School, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

export default async function ConfigInstitucionalPage() {
  // Obtener datos de la institución
  const { success, data: instituciones, error } = await getInstituciones();

  // Por ahora trabajamos con la primera institución (en el futuro podría haber selector)
  const institucion = instituciones?.[0] || null;
  
  // Obtener usuarios administrativos con cargo director
  const { success: usuariosSuccess, data: usuarios = [] } = await getUsuarios(institucion?.id, true);
  
  // Encontrar el usuario con rol administrativo y cargo director
  const directorAdministrativo = usuarios.find(user => 
    user.role === "administrativo" && user.cargo === "director"
  );
  
  // Formatear el nombre del director administrativo
  const directorNombre = directorAdministrativo ?
    `${directorAdministrativo.name || ''} ${directorAdministrativo.apellidoPaterno || ''} ${directorAdministrativo.apellidoMaterno || ''}`.trim() :
    'No asignado';

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración Institucional</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la información general de tu institución educativa
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {!success && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar datos</CardTitle>
            <CardDescription>{error || "No se pudieron cargar los datos de la institución"}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {success && !institucion && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración inicial</CardTitle>
            <CardDescription>
              No hay ninguna institución configurada. Por favor, completa el siguiente formulario para comenzar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InstitucionForm />
          </CardContent>
        </Card>
      )}

      {success && institucion && (
        <>
          {/* Resumen de información institucional */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Información General */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Institución Educativa</dt>
                  <dd className="text-base font-medium">{institucion.nombreInstitucion}</dd>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <School className="h-3 w-3" />
                      Código Modular
                    </dt>
                    <dd className="text-sm font-mono bg-muted px-2 py-1 rounded">{institucion.codigoModular}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Tipo de Gestión</dt>
                    <dd>
                      <Badge variant="secondary">{institucion.tipoGestion}</Badge>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Modalidad</dt>
                    <dd>
                      <Badge variant="outline">{institucion.modalidad}</Badge>
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                  <dd className="text-base">{institucion.direccion}</dd>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-muted-foreground">Distrito / Provincia</dt>
                      <dd className="text-sm">
                        {institucion.distrito} / {institucion.provincia}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-muted-foreground">Departamento</dt>
                      <dd className="text-sm font-medium">{institucion.departamento}</dd>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <dt className="text-sm font-medium text-muted-foreground">UGEL / DRE</dt>
                    <dd className="text-sm">
                      <span className="font-medium">{institucion.ugel}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className="font-medium">{institucion.dre}</span>
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Año Escolar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <div className="flex-1">
                    <span>Año Escolar</span>
                    <div className="text-sm font-normal text-muted-foreground">{institucion.cicloEscolarActual}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-muted-foreground">Inicio de Clases</dt>
                      <dd className="text-sm font-medium">{formatDate(institucion.fechaInicioClases)}</dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-muted-foreground">Fin de Clases</dt>
                      <dd className="text-sm font-medium">{formatDate(institucion.fechaFinClases)}</dd>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Niveles Educativos
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {institucion.niveles && institucion.niveles.length > 0 ? (
                      institucion.niveles.map((nivel) => (
                        <Badge key={nivel.id} variant="secondary">
                          {nivel.nombre.charAt(0).toUpperCase() + nivel.nombre.slice(1)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No hay niveles asignados</span>
                    )}
                  </dd>
                </div>
              </CardContent>
            </Card>

            {/* Director */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Director(a)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Nombre Completo</dt>
                    <dd className="text-base capitalize">{directorNombre}</dd>
                  </div>

                  <Separator />
                  
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-muted-foreground">Cargo</dt>
                      <dd className="text-sm capitalize">{directorAdministrativo?.cargo || 'No asignado'}</dd>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-muted-foreground">Correo electrónico</dt>
                      <dd className="text-sm">{directorAdministrativo?.email || 'No asignado'}</dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                    <dd>
                      {directorAdministrativo ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Asignado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                          No asignado
                        </Badge>
                      )}
                    </dd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pestañas para editar diferentes secciones */}
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="contacto">Contacto</TabsTrigger>
              <TabsTrigger value="academico">Configuración Académica</TabsTrigger>
              <TabsTrigger value="documentos">Documentos Oficiales</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>
                    Actualiza la información básica de tu institución educativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InstitucionForm institucion={institucion} seccion="general" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacto" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>
                    Actualiza los datos de contacto y ubicación de tu institución
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InstitucionForm institucion={institucion} seccion="contacto" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración Académica</CardTitle>
                  <CardDescription>
                    Gestiona el año escolar, niveles académicos y calendario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InstitucionForm institucion={institucion} seccion="academico" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Oficiales</CardTitle>
                  <CardDescription>
                    Actualiza información sobre resoluciones y documentos legales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InstitucionForm institucion={institucion} seccion="documentos" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}