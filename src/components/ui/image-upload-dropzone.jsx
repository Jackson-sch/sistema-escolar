"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ImageUploadDropzone = ({
  onImageUpload,
  maxSize = 5 * 1024 * 1024,
  className = "",
}) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          setError(
            `Archivo muy grande. Máximo ${Math.round(
              maxSize / 1024 / 1024
            )}MB permitido.`
          );
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          setError(
            "Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG o WebP."
          );
        } else {
          setError("Error al procesar el archivo.");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        // Crear preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Llamar callback con el archivo
        onImageUpload(file);
      }
    },
    [onImageUpload, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize,
    multiple: false,
  });

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onImageUpload(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!preview ? (
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed cursor-pointer transition-all duration-200 p-0
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }
            ${error ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div
              className={`
              flex items-center justify-center w-16 h-16 rounded-full mb-4
              ${error ? "bg-red-100 dark:bg-red-900/50" : "bg-muted"}
            `}
            >
              {error ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {error ? (
              <div className="space-y-2">
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Error al subir archivo
                </p>
                <p className="text-sm text-red-500">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                  className="mt-2"
                >
                  Intentar de nuevo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Suelta la imagen aquí"
                    : "Arrastra una imagen o haz clic para seleccionar"}
                </p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG o WebP (máx. {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="relative">
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img
                  src={preview}
                  alt="Preview del comprobante"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Imagen cargada correctamente
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  La imagen se subirá cuando envíes el formulario
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeImage}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
