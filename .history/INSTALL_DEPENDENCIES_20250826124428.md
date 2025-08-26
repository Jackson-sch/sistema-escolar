# Dependencias a Instalar

Para que el componente de drag and drop funcione correctamente, necesitas instalar:

```bash
npm install react-dropzone
```

## ¿Qué hace react-dropzone?

- Proporciona funcionalidad de drag and drop para archivos
- Maneja validaciones de tipo y tamaño de archivo
- Es accesible y fácil de usar
- Tamaño: ~2.5kb gzipped

## Uso

El componente `ImageUploadDropzone` ya está integrado en el formulario de pago y permite:

- Arrastrar y soltar imágenes
- Hacer clic para seleccionar archivos
- Validar tipos de archivo (JPG, PNG, WebP)
- Validar tamaño máximo (5MB por defecto)
- Mostrar preview de la imagen
- Manejar errores de validación

## Archivos modificados

1. `src/components/ui/image-upload-dropzone.jsx` - Nuevo componente
2. `src/components/pagos/FormularioPagoRealizado.jsx` - Integración del componente
