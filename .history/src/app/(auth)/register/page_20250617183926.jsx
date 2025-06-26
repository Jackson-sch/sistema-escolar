import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import FormRegister from "../components/FormRegister";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full relative overflow-hidden z-50">
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <CardHeader>
          <CardTitle className="text-2xl text-center">Registro</CardTitle>
          <CardDescription>
            Ingrese sus datos para crear una cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormRegister />
        </CardContent>
      </Card>
    </div>
  );
}
