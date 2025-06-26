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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Register</CardTitle>
        <CardDescription>
          Complete el formulario para crear su cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormRegister />
      </CardContent>
    </Card>
  );
}
