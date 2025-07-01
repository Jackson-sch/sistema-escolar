"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Constantes
const REQUIRED_FIELDS = ["name", "dni", "fechaNacimiento", "padreId"];
const STUDENT_ROLE = "estudiante";
const DEFAULT_PARENTESCO = "padre";

// Utilidades de validación
class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.errors = errors;
  }
}

function validateRequiredFields(data) {
  const missingFields = REQUIRED_FIELDS.filter(field => !data[field]);

  if (missingFields.length > 0) {
    const errors = missingFields.map(field => ({
      field,
      message: `El campo ${field} es obligatorio.`
    }));
    throw new ValidationError(errors);
  }
}

function normalizeEmail(email) {
  return email && email.trim() !== "" ? email : null;
}

function normalizeOptionalField(value) {
  return value && value.trim() !== "" ? value : null;
}

// Servicios de validación de unicidad
async function checkUniqueConstraints(data, excludeId = null) {
  const checks = [];
  const errors = [];

  // Verificar DNI
  checks.push(
    db.user.findUnique({
      where: { dni: data.dni },
      select: { id: true }
    }).then(result => ({ field: "dni", result, message: "El DNI ya está registrado." }))
  );

  // Verificar email si se proporciona
  if (data.email && data.email.trim() !== "") {
    checks.push(
      db.user.findUnique({
        where: { email: data.email },
        select: { id: true }
      }).then(result => ({ field: "email", result, message: "El email ya está registrado." }))
    );
  }

  // Verificar código SIAGIE si se proporciona
  if (data.codigoSiagie && data.codigoSiagie.trim() !== "") {
    checks.push(
      db.user.findUnique({
        where: { codigoSiagie: data.codigoSiagie },
        select: { id: true }
      }).then(result => ({ field: "codigoSiagie", result, message: "El Código Siagie ya está registrado." }))
    );
  }

  // Verificar código Estudiante si se proporciona
  if (data.codigoEstudiante && data.codigoEstudiante.trim() !== "") {
    checks.push(
      db.user.findUnique({
        where: { codigoEstudiante: data.codigoEstudiante },
        select: { id: true }
      }).then(result => ({ field: "codigoEstudiante", result, message: "El Código Estudiante ya está registrado." }))
    );
  }

  const results = await Promise.all(checks);

  // Evaluar resultados
  results.forEach(({ field, result, message }) => {
    if (result && (!excludeId || result.id !== excludeId)) {
      errors.push({ field, message });
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

// Servicio de relaciones familiares
async function upsertFamilyRelation(padreId, hijoId) {
  if (!padreId) return;

  await db.relacionFamiliar.upsert({
    where: {
      padreTutorId_hijoId: {
        padreTutorId: padreId,
        hijoId: hijoId,
      },
    },
    update: {
      parentesco: DEFAULT_PARENTESCO,
      contactoPrimario: true,
    },
    create: {
      padreTutorId: padreId,
      hijoId: hijoId,
      parentesco: DEFAULT_PARENTESCO,
      contactoPrimario: true,
    },
  });
}

// Preparar datos para creación/actualización
function prepareStudentData(data, isUpdate = false) {
  const { padreId, institucionId, ...restData } = data;

  const studentData = {
    ...restData,
    email: normalizeEmail(restData.email),
    codigoSiagie: normalizeOptionalField(restData.codigoSiagie),
    codigoEstudiante: normalizeOptionalField(restData.codigoEstudiante),
  };

  if (!isUpdate) {
    studentData.role = STUDENT_ROLE;
  }


  // Conectar institución
  if (institucionId) {
    studentData.institucion = { connect: { id: institucionId } };
  }

  return studentData;
}

// Función para manejar errores
function handleError(error, operation) {
  console.error(`Error en ${operation}:`, error);

  if (error instanceof ValidationError) {
    return {
      success: false,
      errors: error.errors,
    };
  }

  return {
    success: false,
    error: `Error al ${operation}: ${error.message}`,
  };
}

// ========== FUNCIONES PRINCIPALES ==========

export async function registerStudent(data) {
  try {
    // Validación inicial
    if (!data || typeof data !== "object") {
      return {
        success: false,
        error: "Datos de registro inválidos. Por favor, intente nuevamente.",
      };
    }

    // Validar campos obligatorios
    validateRequiredFields(data);

    // Verificar restricciones de unicidad
    await checkUniqueConstraints(data);

    // Preparar datos para creación
    const studentData = prepareStudentData(data);

    console.log("Datos a insertar en la BD:", studentData);

    // Crear estudiante
    const newStudent = await db.user.create({
      data: studentData,
    });

    // Crear relación familiar
    await upsertFamilyRelation(data.padreId, newStudent.id);

    console.log("Estudiante registrado exitosamente:", newStudent);
    revalidatePath("/estudiantes");

    return {
      success: true,
      data: newStudent,
    };

  } catch (error) {
    return handleError(error, "registrar el estudiante");
  }
}

export async function updateStudent(data) {
  try {
    // Verificar restricciones de unicidad (excluyendo el mismo estudiante)
    await checkUniqueConstraints(data, data.id);

    // Preparar datos para actualización
    const updateData = prepareStudentData(data, true);


    const updatedStudent = await db.user.update({
      where: { id: data.id },
      data: updateData,
    });

    // Actualizar relación familiar
    await upsertFamilyRelation(data.padreId, data.id);

    return {
      success: true,
      data: updatedStudent,
    };

  } catch (error) {
    return handleError(error, "actualizar el estudiante");
  }
}

export async function getStudents() {
  try {
    const students = await db.user.findMany({
      where: { role: STUDENT_ROLE },
      orderBy: [{ name: "asc" }, { dni: "asc" }],
      select: {
        // Campos básicos de identificación
        id: true,
        name: true,
        email: true,

        // Información personal básica del estudiante
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        fechaNacimiento: true,
        sexo: true,
        nacionalidad: true,

        // Información de contacto
        direccion: true,
        ubigeo: true,
        distrito: true,
        provincia: true,
        departamento: true,
        telefono: true,
        telefonoEmergencia: true,

        // Códigos oficiales del estudiante
        codigoEstudiante: true,
        codigoSiagie: true,

        // Información médica básica
        tipoSangre: true,
        alergias: true,
        condicionesMedicas: true,
        contactoEmergencia: true,

        // Campos académicos específicos
        nivelAcademicoId: true,
        turno: true,

        // Información socioeconómica
        viveConPadres: true,
        tipoVivienda: true,
        serviciosBasicos: true,
        transporteEscolar: true,
        becario: true,
        tipoBeca: true,
        programaSocial: true,

        // Relaciones del estudiante
        nivelAcademico: {
          select: {
            id: true,
            seccion: true,
            nivel: {
              select: {
                id: true,
                nombre: true
              }
            },
            grado: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
            // Agrega otros campos del nivel académico que necesites
          }
        },

        institucion: {
          select: {
            id: true,
            nombreInstitucion: true,
            codigoModular: true,
            // Agrega otros campos de la institución que necesites
          }
        },

        padresTutores: {
          select: {
            padreTutorId: true,
            parentesco: true,
            contactoPrimario: true,
            padreTutor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                dni: true,
                telefono: true,
                email: true,
                ocupacion: true,
                lugarTrabajo: true,
              }
            }
          }
        },

        // Campos de control
        estado: true,
        createdAt: true,
        updatedAt: true,
      },

    });

    return students.map((student) => ({
      ...student,
      padreId: student.padresTutores[0]?.padreTutorId ?? null,
      createdAt: student.createdAt?.toISOString() ?? null,
      updatedAt: student.updatedAt?.toISOString() ?? null,
    }));

  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    throw new Error("Error al obtener la lista de estudiantes.");
  }
}

export async function deleteStudent(studentId) {
  try {
    if (!studentId || typeof studentId !== "string" || studentId.trim() === "") {
      throw new Error("ID inválido");
    }

    await db.user.delete({
      where: { id: studentId },
    });

    revalidatePath("/estudiante/lista");

  } catch (error) {
    console.error("Error al eliminar el estudiante:", error);
    throw new Error("Error al eliminar el estudiante.");
  }
}