"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function registerAdministrativo(data) {
  try {
    // Verificar email y DNI simultáneamente
    const [existingUser, existingDNI] = await Promise.all([
      db.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      }),
      db.user.findUnique({ where: { dni: data.dni }, select: { id: true } }),
    ]);
    if (existingUser) {
      throw new Error("Ya existe un usuario con este correo electrónico.");
    }
    if (existingDNI) {
      throw new Error("Ya existe un usuario con este DNI.");
    }
    const newAdministrativo = await db.user.create({
      data: {
        ...data,
        role: "administrativo",
      },
    });
    return { success: true, data: newAdministrativo };
  } catch (error) {
    console.error("Error al crear administrativo:", error.message);
    return {
      success: false,
      errors: [{ field: "general", message: error.message }]
    };
  }
}

export async function updateAdministrativo(data) {
  try {
    const updateAdministrativo = await db.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        dni: data.dni,
        fechaNacimiento: data.fechaNacimiento,
        direccion: data.direccion,
        telefono: data.telefono,
        cargo: data.cargo,
        area: data.area,
        fechaIngreso: data.fechaIngreso,
        fechaSalida: data.fechaSalida,
        estado: data.estado,
      },
    });
    return { success: true, data: updateAdministrativo };
  } catch (error) {
    console.error("Error al actualizar administrativo:", error.message);
    return {
      success: false,
      errors: [{ field: "general", message: error.message }]
    };
  }
}

export async function getAdministrativos() {
  const administrativos = await db.user.findMany({
    where: { role: "administrativo", NOT: { cargo: "administrador" } },
    orderBy: [{ name: "asc" }, { dni: "asc" }],
    select: {
      id: true,
      name: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
      email: true,
      dni: true,
      fechaNacimiento: true,
      direccion: true,
      telefono: true,
      cargo: true,
      area: true,
      fechaIngreso: true,
      fechaSalida: true,
      role: true,
      estado: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return administrativos.map((a) => ({
    ...a,
    fullName: `${a.name} ${a.apellidoPaterno} ${a.apellidoMaterno}`,
    createdAt: a.createdAt?.toISOString() ?? null,
    updatedAt: a.updatedAt?.toISOString() ?? null,
  }));
}

export async function deleteAdministrativo(id) {
  try {
    const administrativo = await db.user.delete({ where: { id } });
    revalidatePath("/administrativo");
    return { success: true, data: administrativo };
  } catch (error) {
    console.error("Error al eliminar el administrativo", error);
    return {
      success: false,
      errors: [{ field: "general", message: error.message }]
    };
  }
}

export async function getAdministrativo(id) {
  try {
    const administrativo = await db.user.findUnique({ where: { id } });
    return { success: true, data: administrativo };
  } catch (error) {
    console.error("Error al obtener el administrativo", error);
    return {
      success: false,
      errors: [{ field: "general", message: error.message }]
    };
  }
}
