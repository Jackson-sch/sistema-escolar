"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function registerPadre(data) {
  try {
    // Verificar email(opcional) y DNI para optimizar las consultas
    const [existingUser, existingDNI] = await Promise.all([
      data.email
        ? db.user.findUnique({
            where: { email: data.email },
            select: { id: true },
          })
        : null,
      db.user.findUnique({
        where: { dni: data.dni },
        select: { id: true },
      }),
    ]);

    // Construir errores solo si corresponde
    const errors = [];
    if (existingDNI) {
      errors.push({ field: "dni", message: "El DNI ya está registrado." });
    }
    if (existingUser && data.email) {
      errors.push({
        field: "email",
        message: "El correo electrónico ya está registrado.",
      });
    }
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    // Guardar el nuevo padre en la base de datos
    const newPadre = await db.user.create({
      data: {
        ...data,
        role: "padre",
      },
    });
    return { ok: true, newPadre };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export async function updatePadre(id, data) {
  try {
    const padre = await { db }.user.update({
      where: { id },
      data,
    });
    return { success: true, data: padre };
  } catch (error) {
    console.error("Error al actualizar el padre", error);
    return { ok: false, error: error.message };
  }
}

export async function deletePadre(id) {
  try {
    const padre = await db.user.delete({ where: { id } });
    revalidatePath("/padre");
    return { success: true, data: padre };
  } catch (error) {
    console.error("Error al eliminar el padre", error);
    return { ok: false, error: error.message };
  }
}

export async function getPadres() {
  const padres = await db.user.findMany({
    where: {
      role: "padre",
    },
    orderBy: [{ name: "asc" }, { dni: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      dni: true,
      direccion: true,
      telefono: true,
      role: true,
      estado: true,
      ocupacion: true,
      lugarTrabajo: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return padres.map((padre) => ({
    ...padre,
    createdAt: padre.createdAt?.toISOString() ?? null,
    updatedAt: padre.updatedAt?.toISOString() ?? null,
  }));
}
