import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth.config";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Buscar usuario en la base de datos
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  // Eliminar usuario
  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
