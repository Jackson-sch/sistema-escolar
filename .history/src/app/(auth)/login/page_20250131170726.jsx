import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormLogin from "../components/FormLogin";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Acceso</CardTitle>
        <CardDescription>
          Ingrese sus credenciales para acceder a su cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormLogin />
      </CardContent>
    </Card>
  );
}
