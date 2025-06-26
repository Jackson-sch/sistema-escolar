"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema } from "@/lib/validaciones/auth";
import { loginAction } from "@/action/auth-action";

// Componente para mostrar errores del formulario
function FormError({ message }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="animate-in fade-in-50 my-3">
      <div className="flex items-start gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
}

export default function FormLogin() {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData) => {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(formData);
      if (response.error) {
        setError(response.error);
        // No duplicamos la notificación como toast si ya mostramos el error en el formulario
      } else {
        router.push("/");
        toast({
          title: "Éxito",
          description: "Sesión iniciada correctamente",
          variant: "default",
        });
      }
    });
  };

  // Determinar si hay errores específicos para resaltar campos
  const hasEmailError = error && error.toLowerCase().includes("email");
  const hasPasswordError = error && error.toLowerCase().includes("contraseña");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-96 items-start gap-4"
      >
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@example.com"
                    {...field}
                    className={
                      hasEmailError
                        ? "border-destructive ring-1 ring-destructive"
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="********"
                    autoComplete="current-password"
                    className={
                      hasPasswordError
                        ? "border-destructive ring-1 ring-destructive"
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Nuevo componente de error */}
        <FormError message={error} />

        <Button type="submit" disabled={isPending} className="relative">
          {isPending ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="hover:text-brand underline">
            Registrar
          </Link>
        </p>
      </form>
    </Form>
  );
}
