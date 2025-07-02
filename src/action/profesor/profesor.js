"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function registerProfesor(data) {

  try {
    console.log("Datos recibidos en registerProfesor:", data);
    
    // Verificar que institucionId esté presente
    if (!data.institucionId) {
      return { 
        success: false, 
        errors: [{ field: "institucionId", message: "La institución es requerida." }]
      };
    }

    // Verificar email y DNI simultáneamente para optimizar las consultas
    const [existingUser, existingDNI] = await Promise.all([
      db.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      }),
      db.user.findUnique({
        where: { dni: data.dni },
        select: { id: true },
      }),
    ]);

    if (existingUser) {
      return { 
        success: false, 
        errors: [{ field: "email", message: "Ya existe un usuario con este correo electrónico." }]
      };
    }

    if (existingDNI) {
      return { 
        success: false, 
        errors: [{ field: "dni", message: "Ya existe un usuario con este DNI." }]
      };
    }

    // Guardar el nuevo profesor en la base de datos
    const newProfesor = await db.user.create({
      data: {
        ...data,
        role: "profesor",
        // Asegurarse de que institucionId sea un string válido
        institucionId: data.institucionId,
      },
    });
    
    // Revalidar la ruta para actualizar la UI
    revalidatePath("/profesor");
    revalidatePath("/config/usuarios-permisos");
    
    return { success: true, data: newProfesor };
  } catch (error) {
    console.error("Error al crear profesor:", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: error.message || "Hubo un error al crear el profesor" }]
    };
  }
}

export async function updateProfesor(data) {
  try {
    console.log("Datos recibidos en updateProfesor:", data);
    
    // Verificar si el email ya existe en otro usuario
    const existingUser = await db.user.findFirst({
      where: {
        email: data.email,
        id: { not: data.id },
      },
    });

    if (existingUser) {
      return { 
        success: false, 
        errors: [{ field: "email", message: "Ya existe otro usuario con este correo electrónico." }]
      };
    }

    // Verificar si el DNI ya existe en otro usuario
    const existingDNI = await db.user.findFirst({
      where: {
        dni: data.dni,
        id: { not: data.id },
      },
    });

    if (existingDNI) {
      return { 
        success: false, 
        errors: [{ field: "dni", message: "Ya existe otro usuario con este DNI." }]
      };
    }
    
    // Extraer todos los campos relevantes para la actualización
    const {
      name,
      email,
      dni,
      fechaNacimiento,
      direccion,
      telefono,
      especialidad,
      titulo,
      fechaContratacion,
      estado,
      sexo,
      tipoContrato,
      institucionId
    } = data;
    
    const updateProfesor = await db.user.update({
      where: {
        id: data.id,
      },
      data: {
        name,
        email,
        dni,
        fechaNacimiento,
        direccion,
        telefono,
        especialidad,
        titulo,
        fechaContratacion,
        estado,
        sexo,
        tipoContrato,
        // Asegurarse de que institucionId sea un string válido si está presente
        ...(institucionId ? { institucionId } : {})
      },
    });

    // Revalidar la ruta para actualizar la UI
    revalidatePath("/profesor");
    revalidatePath("/config/usuarios-permisos");
    
    return { success: true, data: updateProfesor };
  } catch (error) {
    console.error("Error al actualizar el profesor", error);
    return { 
      success: false, 
      errors: [{ field: "general", message: error.message || "Hubo un error al actualizar el profesor" }]
    };
  }
}

export async function getProfesores() {
  const profesores = await db.User.findMany({
    where: { role: "profesor", estado: "activo" },
    orderBy: [{ name: "asc" }, { dni: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      dni: true,
      fechaNacimiento: true,
      direccion: true,
      telefono: true,
      sexo: true,
      especialidad: true,
      titulo: true,
      tipoContrato: true,
      fechaContratacion: true,
      role: true,
      estado: true,
      createdAt: true,
      updatedAt: true,
      institucionId: true,
    },
  });

  return profesores.map((profesor) => ({
    ...profesor,
    createdAt: profesor.createdAt?.toISOString() ?? null,
    updatedAt: profesor.updatedAt?.toISOString() ?? null,
  }));
}

export async function deleteProfesor(id) {
  try {
    const profesor = await db.user.delete({
      where: { id: id },
    });
    revalidatePath("/profesores");
    return { success: true, data: profesor };
  } catch (error) {
    console.error("Error al eliminar el profesor", error);
    return { success: false, error: error.message };
  }
}

export async function getProfesor(id) {
  try {
    const profesor = await db.user.findUnique({
      where: { id: id },
    });
    return { success: true, data: profesor };
  } catch (error) {
    console.error("Error al obtener el profesor", error);
    return { success: false, error: error.message };
  }
}

export async function getProfesoresActivos() {
  try {
    // Verificar primero si el campo estado existe en el modelo User
    const userFields = await db.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'estado'
    `;
    
    // Construir la consulta basada en la existencia del campo estado
    let profesores;
    if (userFields && userFields.length > 0) {
      // Si el campo estado existe, filtrar por él
      profesores = await db.user.findMany({
        where: { role: "profesor", estado: "activo" },
        orderBy: [{ name: "asc" }, { dni: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          dni: true,
          fechaNacimiento: true,
          direccion: true,
          telefono: true,
          fechaIngreso: true,
          especialidad: true,
          titulo: true,
          fechaContratacion: true,
          role: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      // Si el campo estado no existe, solo filtrar por rol
      profesores = await db.user.findMany({
        where: { role: "profesor" },
        orderBy: [{ name: "asc" }, { dni: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          dni: true,
          fechaNacimiento: true,
          direccion: true,
          telefono: true,
          fechaIngreso: true,
          especialidad: true,
          titulo: true,
          fechaContratacion: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }
    
    // Formatear fechas para serialización JSON
    return profesores.map((profesor) => ({
      ...profesor,
      createdAt: profesor.createdAt?.toISOString() ?? null,
      updatedAt: profesor.updatedAt?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("Error al obtener profesores activos:", error);
    throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
  }
}