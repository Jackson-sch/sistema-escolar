"use client";

import { useState, useTransition, useEffect } from "react";
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
import { 
  passwordResetRequestSchema, 
  passwordResetSchema 
} from "@/lib/validaciones/auth";
import { 
  requestPasswordReset, 
  resetPassword 
} from "@/action/auth-action";

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

// Componente para mostrar mensajes de éxito
function SuccessMessage({ message }) {
  if (!message) return null;

  return (
    <Alert className="animate-in fade-in-50 my-3 bg-green-50 text-green-800 border-green-200">
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
          className="h-4 w-4 mt-0.5 text-green-600"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
}

export default function FormPasswordRecovery({ token }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [demoToken, setDemoToken] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  
  // Asegurarse de que token siempre sea una cadena para evitar el error de input no controlado
  const safeToken = token || "";

  // Determinar qué formulario mostrar basado en la presencia de token
  const isResetMode = !!token;

  // Configurar el formulario según el modo
  const form = useForm({
    resolver: zodResolver(isResetMode ? passwordResetSchema : passwordResetRequestSchema),
    defaultValues: isResetMode 
      ? {
          token: safeToken,
          password: "",
          confirmPassword: "",
        }
      : {
          email: "",
        },
    mode: "onChange",
  });
  
  // Asegurar que el token se actualice en el formulario cuando cambie
  useEffect(() => {
    if (isResetMode && safeToken) {
      form.setValue("token", safeToken);
    }
  }, [safeToken, isResetMode, form]);

  const onSubmit = async (formData) => {
    setError(null);
    setSuccess(null);
    
    // Depurar datos del formulario
    console.log("Datos del formulario:", formData);
    console.log("Token:", safeToken);
    console.log("isResetMode:", isResetMode);
    
    startTransition(async () => {
      try {
        if (isResetMode) {
          // Asegurarse de que el token esté incluido en los datos del formulario
          // Verificar si el token ya está en formData o si necesitamos agregarlo
          let dataToSubmit = formData;
          
          if (!formData.token || formData.token === "") {
            dataToSubmit = {
              ...formData,
              token: safeToken
            };
          }
          
          console.log("Enviando solicitud de resetPassword con:", dataToSubmit);
          
          const response = await resetPassword(dataToSubmit);
          console.log("Respuesta del servidor:", response);
          
          if (response.error) {
            setError(response.error);
            console.error("Error al restablecer contraseña:", response.error);
            if (response.fieldErrors) {
              // Manejar errores específicos de campos
              Object.entries(response.fieldErrors).forEach(([field, errors]) => {
                form.setError(field, { 
                  type: "manual", 
                  message: errors[0] 
                });
              });
            }
          // Verificar ambos formatos posibles de respuesta de éxito
          } else if (response.success || typeof response.success === 'string') {
            setSuccess("Contraseña actualizada correctamente. Serás redirigido al inicio de sesión.");
            form.reset(); // Limpiar el formulario
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
              router.push("/login");
            }, 3000);
          }
        } else {
          // Modo de solicitud de recuperación
          const response = await requestPasswordReset(formData);
          
          if (response.error) {
            setError(response.error);
          } else {
            setSuccess(response.message || "Se ha enviado un enlace de recuperación a tu correo electrónico");
            
            // Para fines de demostración, mostrar el token (eliminar en producción)
            if (response.demoToken) {
              setDemoToken(response.demoToken);
            }
            
            toast({
              title: "Éxito",
              description: "Se ha enviado un enlace de recuperación a tu correo electrónico",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error("Error en el proceso de recuperación:", error);
        setError("Error al procesar la solicitud. Inténtalo de nuevo más tarde.");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-96 items-start gap-4"
      >
        {!isResetMode ? (
          // Formulario de solicitud de recuperación
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          // Formulario de restablecimiento de contraseña
          <>
            {/* Campo oculto para el token - usando un input directo para evitar problemas */}
            <input 
              type="hidden" 
              name="token" 
              value={safeToken} 
              onChange={(e) => form.setValue("token", e.target.value)}
            />
            
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="********"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="********"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {/* Mostrar errores */}
        <FormError message={error} />
        
        {/* Mostrar mensajes de éxito */}
        <SuccessMessage message={success} />
        
        {/* Mostrar token de demostración (solo para desarrollo) */}
        {demoToken && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Token de recuperación (solo para demostración):</p>
              <div className="p-2 bg-yellow-100 rounded text-xs break-all">
                <pre>{demoToken}</pre>
              </div>
              <p className="text-xs mt-1">
                <Link 
                  href={`/recovery?token=${demoToken}`} 
                  className="underline font-medium"
                >
                  Haz clic aquí para usar este token
                </Link>
              </p>
            </div>
          </Alert>
        )}

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
              {isResetMode ? "Actualizando contraseña..." : "Enviando solicitud..."}
            </>
          ) : (
            isResetMode ? "Actualizar contraseña" : "Enviar solicitud"
          )}
        </Button>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="hover:text-brand underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </Form>
  );
}
