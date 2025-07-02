import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormPasswordRecovery from "../components/FormPasswordRecovery";

export default function RecoveryPage({ searchParams }) {
  // Verificar si hay un token en los parámetros de búsqueda
  const token = searchParams.token || "";
  const isResetMode = !!token;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full relative overflow-hidden z-50">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isResetMode ? "Restablecer contraseña" : "Recuperar contraseña"}
          </CardTitle>
          <CardDescription>
            {isResetMode
              ? "Ingresa tu nueva contraseña"
              : "Ingresa tu correo electrónico para recibir un enlace de recuperación"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormPasswordRecovery token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
