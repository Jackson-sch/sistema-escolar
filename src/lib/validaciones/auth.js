import { object, string } from "zod";

export const loginSchema = object({
  email: string({
    required_error: "Por favor, ingresa tu correo electrónico.",
  }).email({
    message: "Dirección de correo electrónico no válida.",
  }),

  password: string({
    required_error: "La contraseña es obligatoria.",
  })
    .min(8, {
      message: "La contraseña debe ser al menos 8 caracteres.",
    })
    .max(32, {
      message: "La contraseña debe ser menos de 32 caracteres.",
    }),
});

export const registerSchema = object({
  name: string().min(2, {
    message: "El nombre debe ser al menos 2 caracteres.",
  }),
  email: string({
    required_error: "Por favor, ingresa tu correo electrónico.",
  }).email({ message: "Dirección de correo electrónico no válida." }),
  password: string({
    required_error: "La contraseña es obligatoria.",
  })
    .min(8, {
      message:
        "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.",
    })
    .max(32, {
      message: "La contraseña debe ser menos de 32 caracteres.",
    })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message:
        "La contraseña debe incluir al menos una letra mayúscula, un número y un carácter especial.",
    }),
});

// Schema para solicitar recuperación de contraseña
export const passwordResetRequestSchema = object({
  email: string({
    required_error: "Por favor, ingresa tu correo electrónico.",
  }).email({
    message: "Dirección de correo electrónico no válida.",
  }),
});

// Schema para establecer nueva contraseña
export const passwordResetSchema = object({
  token: string({
    required_error: "Token no válido.",
  }),
  password: string({
    required_error: "La contraseña es obligatoria.",
  })
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    })
    .max(32, {
      message: "La contraseña debe ser menos de 32 caracteres.",
    })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message:
        "La contraseña debe incluir al menos una letra mayúscula, un número y un carácter especial.",
    }),
  confirmPassword: string({
    required_error: "Por favor, confirma tu contraseña.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});
