import { NextResponse } from "next/server";
import { changePassword } from "@/action/auth-action";
import { auth } from "@/auth"; // Cambio aquí

export async function POST(req) {
  try {
    // Obtener la sesión usando auth() en lugar de getServerSession
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    
    const { currentPassword, newPassword } = await req.json();
    
    await changePassword({
      userId: session.user.id,
      currentPassword,
      newPassword,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}