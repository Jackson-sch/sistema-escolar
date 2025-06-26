-- CreateEnum
CREATE TYPE "Role" AS ENUM ('estudiante', 'profesor', 'administrativo', 'director', 'padre');

-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('ninguno', 'administrador', 'asistente', 'auxiliar', 'director', 'secretaria', 'contador', 'coordinador', 'mantenimiento', 'subdirector', 'coordinador_academico', 'coordinador_tutoria', 'psicologia', 'enfermeria');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo', 'suspendido', 'eliminado', 'retirado', 'egresado', 'licencia', 'vacaciones', 'trasladado', 'graduado', 'condicional', 'practicante', 'jubilado', 'expulsado');

-- CreateEnum
CREATE TYPE "TipoGestion" AS ENUM ('PUBLICA', 'PRIVADA', 'PARROQUIAL', 'CONVENIO');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'DISTANCIA', 'SEMIPRESENCIAL');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'TARDE', 'NOCHE', 'CONTINUO');

-- CreateEnum
CREATE TYPE "EscalaCalificacion" AS ENUM ('VIGESIMAL', 'LITERAL', 'DESCRIPTIVA');

-- CreateEnum
CREATE TYPE "TipoPeriodo" AS ENUM ('BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'ANUAL');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CERTIFICADO_ESTUDIOS', 'CONSTANCIA_MATRICULA', 'CONSTANCIA_VACANTE', 'TRASLADO', 'BOLETA_NOTAS', 'ACTA_NOTAS', 'FICHA_MATRICULA', 'RECORD_ACADEMICO', 'CONSTANCIA_EGRESADO', 'DIPLOMA_TITULO', 'PARTIDA_NACIMIENTO', 'DNI_COPIA', 'FOTO', 'FICHA_SOCIOECONOMICA');

-- CreateEnum
CREATE TYPE "TipoEvaluacion" AS ENUM ('DIAGNOSTICA', 'FORMATIVA', 'SUMATIVA', 'RECUPERACION', 'EXAMEN_FINAL', 'TRABAJO_PRACTICO', 'PROYECTO', 'EXPOSICION');

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "id" TEXT NOT NULL,
    "rol" "Role" NOT NULL,
    "permisoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPermiso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsuarioPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitucionEducativa" (
    "id" TEXT NOT NULL,
    "codigoModular" TEXT NOT NULL,
    "nombreInstitucion" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "tipoGestion" "TipoGestion" NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "ugel" TEXT NOT NULL,
    "dre" TEXT NOT NULL,
    "ubigeo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "resolucionCreacion" TEXT,
    "fechaCreacion" TIMESTAMP(3),
    "resolucionActual" TEXT,
    "logo" TEXT,
    "directorId" TEXT,
    "cicloEscolarActual" INTEGER NOT NULL DEFAULT 2025,
    "fechaInicioClases" TIMESTAMP(3) NOT NULL,
    "fechaFinClases" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitucionEducativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'estudiante',
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "dni" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "nacionalidad" TEXT DEFAULT 'PERUANA',
    "direccion" TEXT,
    "ubigeo" TEXT,
    "distrito" TEXT,
    "provincia" TEXT,
    "departamento" TEXT,
    "telefono" TEXT,
    "telefonoEmergencia" TEXT,
    "codigoEstudiante" TEXT,
    "codigoSiagie" TEXT,
    "codigoModular" TEXT,
    "numeroExpediente" TEXT,
    "tipoSangre" TEXT,
    "alergias" TEXT,
    "condicionesMedicas" TEXT,
    "contactoEmergencia" TEXT,
    "cargo" "Cargo" DEFAULT 'ninguno',
    "area" TEXT,
    "fechaIngreso" TIMESTAMP(3),
    "fechaSalida" TIMESTAMP(3),
    "numeroContrato" TEXT,
    "nivelAcademicoId" TEXT,
    "turno" "Turno",
    "viveConPadres" BOOLEAN,
    "tipoVivienda" TEXT,
    "serviciosBasicos" TEXT,
    "transporteEscolar" BOOLEAN DEFAULT false,
    "becario" BOOLEAN DEFAULT false,
    "tipoBeca" TEXT,
    "programaSocial" TEXT,
    "especialidad" TEXT,
    "titulo" TEXT,
    "colegioProfesor" TEXT,
    "fechaContratacion" TIMESTAMP(3),
    "tipoContrato" TEXT,
    "escalaMagisterial" TEXT,
    "ocupacion" TEXT,
    "lugarTrabajo" TEXT,
    "ingresoFamiliar" TEXT,
    "gradoInstruccion" TEXT,
    "institucionId" TEXT,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelacionFamiliar" (
    "id" TEXT NOT NULL,
    "padreTutorId" TEXT NOT NULL,
    "hijoId" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "contactoPrimario" BOOLEAN NOT NULL DEFAULT false,
    "autorizadoRecoger" BOOLEAN NOT NULL DEFAULT true,
    "viveCon" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,

    CONSTRAINT "RelacionFamiliar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Nivel" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "institucionId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "nivelId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NivelAcademico" (
    "id" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "descripcion" TEXT,
    "capacidad" INTEGER NOT NULL DEFAULT 30,
    "capacidadMaxima" INTEGER,
    "aulaAsignada" TEXT,
    "nivelId" TEXT,
    "gradoId" TEXT,
    "tutorId" TEXT,
    "institucionId" TEXT NOT NULL,
    "anioAcademico" INTEGER NOT NULL DEFAULT 2025,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "turno" "Turno" NOT NULL DEFAULT 'MANANA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NivelAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodoAcademico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoPeriodo" NOT NULL,
    "numero" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "anioEscolar" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "institucionId" TEXT NOT NULL,

    CONSTRAINT "PeriodoAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaCurricular" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "nivel" TEXT NOT NULL,
    "orden" INTEGER,
    "color" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "competencias" TEXT,
    "institucionId" TEXT NOT NULL,

    CONSTRAINT "AreaCurricular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "nivel" TEXT NOT NULL,
    "anioAcademico" INTEGER NOT NULL,
    "horasSemanales" INTEGER,
    "creditos" INTEGER,
    "areaCurricularId" TEXT NOT NULL,
    "nivelAcademicoId" TEXT,
    "gradoId" TEXT,
    "profesorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "aula" TEXT,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" TEXT NOT NULL,
    "numeroMatricula" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "nivelAcademicoId" TEXT NOT NULL,
    "anioAcademico" INTEGER NOT NULL,
    "fechaMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "esPrimeraVez" BOOLEAN NOT NULL DEFAULT false,
    "esRepitente" BOOLEAN NOT NULL DEFAULT false,
    "procedencia" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatriculaCurso" (
    "id" TEXT NOT NULL,
    "matriculaId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "userId" TEXT,

    CONSTRAINT "MatriculaCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoEvaluacion" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "fechaLimite" TIMESTAMP(3),
    "peso" DOUBLE PRECISION NOT NULL,
    "notaMinima" DOUBLE PRECISION,
    "escalaCalificacion" "EscalaCalificacion" NOT NULL DEFAULT 'VIGESIMAL',
    "cursoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "recuperable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorLiteral" TEXT,
    "valorDescriptivo" TEXT,
    "comentario" TEXT,
    "estudianteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "registradoPor" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "tardanza" BOOLEAN NOT NULL DEFAULT false,
    "horaLlegada" TEXT,
    "justificada" BOOLEAN NOT NULL DEFAULT false,
    "justificacion" TEXT,
    "estudianteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "registradoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "ruta" TEXT NOT NULL,
    "tamaño" INTEGER,
    "extension" TEXT,
    "usuarioId" TEXT NOT NULL,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "descripcion" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "verificadoPor" TEXT,
    "fechaVerificacion" TIMESTAMP(3),
    "publico" BOOLEAN NOT NULL DEFAULT false,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "numeroBoleta" TEXT,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "metodoPago" TEXT,
    "referenciaPago" TEXT,
    "numeroOperacion" TEXT,
    "entidadBancaria" TEXT,
    "comprobante" TEXT,
    "recibo" TEXT,
    "estudianteId" TEXT NOT NULL,
    "observaciones" TEXT,
    "descuento" DOUBLE PRECISION DEFAULT 0,
    "mora" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "resumen" TEXT,
    "imagen" TEXT,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "dirigidoA" TEXT NOT NULL,
    "importante" BOOLEAN NOT NULL DEFAULT false,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "fijado" BOOLEAN NOT NULL DEFAULT false,
    "autorId" TEXT NOT NULL,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT,
    "horaFin" TEXT,
    "fechaLimiteInscripcion" TIMESTAMP(3),
    "ubicacion" TEXT,
    "aula" TEXT,
    "direccion" TEXT,
    "modalidad" TEXT,
    "enlaceVirtual" TEXT,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "publico" BOOLEAN NOT NULL DEFAULT true,
    "dirigidoA" TEXT,
    "capacidadMaxima" INTEGER,
    "requiereInscripcion" BOOLEAN NOT NULL DEFAULT false,
    "organizadorId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'programado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnuncioToNivel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnuncioToNivel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnuncioToGrado" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnuncioToGrado_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventoToNivel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventoToNivel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventoToGrado" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventoToGrado_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "RolPermiso_rol_permisoId_key" ON "RolPermiso"("rol", "permisoId");

-- CreateIndex
CREATE INDEX "UsuarioPermiso_usuarioId_idx" ON "UsuarioPermiso"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioPermiso_permisoId_idx" ON "UsuarioPermiso"("permisoId");

-- CreateIndex
CREATE INDEX "UsuarioPermiso_activo_idx" ON "UsuarioPermiso"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPermiso_usuarioId_permisoId_key" ON "UsuarioPermiso"("usuarioId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitucionEducativa_codigoModular_key" ON "InstitucionEducativa"("codigoModular");

-- CreateIndex
CREATE UNIQUE INDEX "InstitucionEducativa_directorId_key" ON "InstitucionEducativa"("directorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoEstudiante_key" ON "User"("codigoEstudiante");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoSiagie_key" ON "User"("codigoSiagie");

-- CreateIndex
CREATE UNIQUE INDEX "User_codigoModular_key" ON "User"("codigoModular");

-- CreateIndex
CREATE UNIQUE INDEX "RelacionFamiliar_padreTutorId_hijoId_key" ON "RelacionFamiliar"("padreTutorId", "hijoId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_nombre_key" ON "Nivel"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Grado_nivelId_codigo_key" ON "Grado"("nivelId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Grado_nivelId_orden_key" ON "Grado"("nivelId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "NivelAcademico_nivelId_gradoId_seccion_anioAcademico_instit_key" ON "NivelAcademico"("nivelId", "gradoId", "seccion", "anioAcademico", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoAcademico_tipo_numero_anioEscolar_institucionId_key" ON "PeriodoAcademico"("tipo", "numero", "anioEscolar", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "AreaCurricular_codigo_nivel_institucionId_key" ON "AreaCurricular"("codigo", "nivel", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_nivelAcademicoId_key" ON "Curso"("codigo", "anioAcademico", "nivelAcademicoId");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_cursoId_diaSemana_horaInicio_key" ON "Horario"("cursoId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_numeroMatricula_key" ON "Matricula"("numeroMatricula");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_estudianteId_anioAcademico_key" ON "Matricula"("estudianteId", "anioAcademico");

-- CreateIndex
CREATE UNIQUE INDEX "MatriculaCurso_matriculaId_cursoId_key" ON "MatriculaCurso"("matriculaId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_estudianteId_evaluacionId_key" ON "Nota"("estudianteId", "evaluacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_estudianteId_cursoId_fecha_key" ON "Asistencia"("estudianteId", "cursoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_numeroBoleta_key" ON "Pago"("numeroBoleta");

-- CreateIndex
CREATE INDEX "_AnuncioToNivel_B_index" ON "_AnuncioToNivel"("B");

-- CreateIndex
CREATE INDEX "_AnuncioToGrado_B_index" ON "_AnuncioToGrado"("B");

-- CreateIndex
CREATE INDEX "_EventoToNivel_B_index" ON "_EventoToNivel"("B");

-- CreateIndex
CREATE INDEX "_EventoToGrado_B_index" ON "_EventoToGrado"("B");

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermiso" ADD CONSTRAINT "UsuarioPermiso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPermiso" ADD CONSTRAINT "UsuarioPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitucionEducativa" ADD CONSTRAINT "InstitucionEducativa_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelacionFamiliar" ADD CONSTRAINT "RelacionFamiliar_padreTutorId_fkey" FOREIGN KEY ("padreTutorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelacionFamiliar" ADD CONSTRAINT "RelacionFamiliar_hijoId_fkey" FOREIGN KEY ("hijoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nivel" ADD CONSTRAINT "Nivel_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grado" ADD CONSTRAINT "Grado_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "Grado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodoAcademico" ADD CONSTRAINT "PeriodoAcademico_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaCurricular" ADD CONSTRAINT "AreaCurricular_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_areaCurricularId_fkey" FOREIGN KEY ("areaCurricularId") REFERENCES "AreaCurricular"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "Grado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCurso" ADD CONSTRAINT "MatriculaCurso_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES "Matricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCurso" ADD CONSTRAINT "MatriculaCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculaCurso" ADD CONSTRAINT "MatriculaCurso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToNivel" ADD CONSTRAINT "_AnuncioToNivel_A_fkey" FOREIGN KEY ("A") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToNivel" ADD CONSTRAINT "_AnuncioToNivel_B_fkey" FOREIGN KEY ("B") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToGrado" ADD CONSTRAINT "_AnuncioToGrado_A_fkey" FOREIGN KEY ("A") REFERENCES "Anuncio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnuncioToGrado" ADD CONSTRAINT "_AnuncioToGrado_B_fkey" FOREIGN KEY ("B") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToNivel" ADD CONSTRAINT "_EventoToNivel_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToNivel" ADD CONSTRAINT "_EventoToNivel_B_fkey" FOREIGN KEY ("B") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToGrado" ADD CONSTRAINT "_EventoToGrado_A_fkey" FOREIGN KEY ("A") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventoToGrado" ADD CONSTRAINT "_EventoToGrado_B_fkey" FOREIGN KEY ("B") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
