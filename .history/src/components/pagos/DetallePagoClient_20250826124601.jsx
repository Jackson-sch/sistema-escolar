"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Printer,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Receipt,
  TrendingUp,
  TrendingDown,
  Copy,
  Share2,
  Eye,
  Building,
  Hash,
  Banknote,
  Wallet,
  Shield,
  Star,
  Timer,
  Archive,
} from "lucide-react";
import { registrarPagoRealizado } from "@/action/pagos/pagoActions";
import FormularioPagoRealizado from "./FormularioPagoRealizado";

// Función mejorada para obtener el estado con mejor diseño
const getEstadoBadge = (estado) => {
  switch (estado) {
    case "pendiente":
      return {
        variant: "secondary",
        icon: <Timer className="h-4 w-4" />,
        className:
          "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
        bgGradient:
          "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10",
        iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    case "pagado":
      return {
        variant: "default",
        icon: <CheckCircle2 className="h-4 w-4" />,
        className:
          "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
        bgGradient:
          "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10",
        iconBg: "bg-green-500/10 dark:bg-green-400/10",
        iconColor: "text-green-600 dark:text-green-400",
      };
    case "vencido":
      return {
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
        className:
          "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
        bgGradient:
          "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10",
        iconBg: "bg-red-500/10 dark:bg-red-400/10",
        iconColor: "text-red-600 dark:text-red-400",
      };
    case "anulado":
      return {
        variant: "outline",
        icon: <XCircle className="h-4 w-4" />,
        className:
          "bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800",
        bgGradient:
          "from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/10",
        iconBg: "bg-gray-500/10 dark:bg-gray-400/10",
        iconColor: "text-gray-600 dark:text-gray-400",
      };
    default:
      return {
        variant: "outline",
        icon: <FileText className="h-4 w-4" />,
        className:
          "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
        bgGradient:
          "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10",
        iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
  }
};

// Función para formatear fechas con mejor manejo de errores
function formatearFecha(fecha) {
  if (!fecha) return "No disponible";
  try {
    return format(new Date(fecha), "PPP", { locale: es });
  } catch (error) {
    return "Fecha inválida";
  }
}

// Función para formatear fecha relativa
function formatearFechaRelativa(fecha) {
  if (!fecha) return "No disponible";
  try {
    const ahora = new Date();
    const fechaPago = new Date(fecha);
    const diffTime = Math.abs(ahora - fechaPago);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return formatearFecha(fecha);
  } catch (error) {
    return "Fecha inválida";
  }
}

// Componente mejorado para mostrar información
const InfoItem = ({
  icon,
  label,
  value,
  className = "",
  tooltip = null,
  variant = "default",
  copyable = false,
  highlight = false,
}) => {
  const [copied, setCopied] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-50/80 dark:bg-green-950/30 border-green-200/50 dark:border-green-800/50 text-green-800 dark:text-green-300";
      case "warning":
        return "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-300";
      case "error":
        return "bg-red-50/80 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/50 text-red-800 dark:text-red-300";
      case "muted":
        return "bg-muted/50 text-muted-foreground border-border/50";
      case "highlight":
        return "bg-primary/5 border-primary/20 text-foreground ring-1 ring-primary/10";
      default:
        return "bg-background/50 hover:bg-muted/30 transition-all duration-200 border-border/50";
    }
  };

  const handleCopy = async () => {
    if (!copyable || !value) return;

    try {
      await navigator.clipboard.writeText(value.toString());
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar");
    }
  };

  const content = (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border ${getVariantClasses()} ${
        highlight ? "ring-2 ring-primary/20" : ""
      } ${className}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </dt>
        <dd
          className={`text-base font-medium text-foreground break-words ${
            highlight ? "text-lg font-semibold" : ""
          }`}
        >
          {value}
        </dd>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          onClick={handleCopy}
        >
          <Copy
            className={`h-3 w-3 ${
              copied ? "text-green-600" : "text-muted-foreground"
            }`}
          />
        </Button>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

// Skeleton mejorado con mejor diseño
const DetallePagoSkeleton = () => (
  <div className="space-y-8 max-w-7xl mx-auto">
    {/* Header skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3 sm:ml-auto">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>

    {/* Summary card skeleton */}
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>

    {/* Grid skeleton */}
    <div className="grid gap-6 lg:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, j) => (
              <div
                key={j}
                className="flex items-start gap-3 p-4 rounded-xl border"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Componente principal mejorado
export default function DetallePagoClient({ pago, isLoading = false }) {
  const router = useRouter();
  const [mostrarFormularioPago, setMostrarFormularioPago] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return <DetallePagoSkeleton />;
  }

  if (!pago) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Pago no encontrado
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          No se pudo cargar la información del pago solicitado. Verifica que el
          enlace sea correcto.
        </p>
        <Button variant="outline" asChild className="bg-transparent">
          <Link href="/pagos/consultar">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a consultas
          </Link>
        </Button>
      </div>
    );
  }

  const estadoInfo = getEstadoBadge(pago.estado);
  const montoTotal = pago.monto - (pago.descuento || 0) + (pago.mora || 0);
  const estaVencido =
    pago.estado === "pendiente" && new Date(pago.fechaVencimiento) < new Date();

  // Calcular días hasta vencimiento
  const diasHastaVencimiento = Math.ceil(
    (new Date(pago.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24)
  );

  // Manejar registro de pago
  const handleRegistrarPago = async (datosPago) => {
    setIsSubmitting(true);
    try {
      const response = await registrarPagoRealizado(pago.id, datosPago);
      if (response.success) {
        toast.success("¡Pago registrado exitosamente!", {
          description: "La información ha sido actualizada correctamente.",
        });
        router.refresh();
        setMostrarFormularioPago(false);
      } else {
        console.error("Error al registrar pago:", response.error);
        toast.error("Error al registrar el pago", {
          description: response.error || "Por favor, intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error("Error al registrar pago:", error);
      toast.error("Error inesperado", {
        description: "No se pudo procesar la solicitud. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Imprimir comprobante
  const imprimirComprobante = async () => {
    setIsPrinting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.print();
      toast.success("Preparando impresión...");
    } catch (error) {
      toast.error("Error al preparar la impresión");
    } finally {
      setIsPrinting(false);
    }
  };

  // Compartir pago
  const compartirPago = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    } catch (error) {
      toast.error("Error al copiar enlace");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header mejorado */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-muted/20 p-8 border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hover:bg-white/50 dark:hover:bg-gray-800/50"
              >
                <Link href="/pagos/consultar">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Detalle del Pago
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background/50">
                    <Hash className="h-3 w-3 mr-1" />
                    {pago.numeroBoleta || pago.id}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {formatearFechaRelativa(pago.fechaEmision)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:ml-auto">
              <Badge
                variant={estadoInfo.variant}
                className={`flex items-center gap-2 py-2 px-4 font-medium text-sm ${estadoInfo.className}`}
              >
                {estadoInfo.icon}
                {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
              </Badge>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={compartirPago}
                      className="bg-transparent"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartir enlace</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={imprimirComprobante}
                      disabled={isPrinting}
                      className="bg-transparent"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Imprimir comprobante</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de vencimiento mejorada */}
      {estaVencido && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10 p-6 border border-red-200/50 dark:border-red-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5" />
          <div className="relative flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 dark:bg-red-400/10">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Pago Vencido
              </h4>
              <p className="text-red-700 dark:text-red-300 leading-relaxed">
                Este pago venció el{" "}
                <strong>{formatearFecha(pago.fechaVencimiento)}</strong>.
                {pago.mora > 0 && (
                  <span className="block mt-1">
                    Se ha aplicado una mora de{" "}
                    <strong>
                      {pago.mora.toFixed(2)} {pago.moneda || "USD"}
                    </strong>
                    .
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de próximo vencimiento */}
      {pago.estado === "pendiente" &&
        !estaVencido &&
        diasHastaVencimiento <= 7 && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 p-6 border border-amber-200/50 dark:border-amber-800/50">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Próximo a Vencer
                </h4>
                <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                  Este pago vence en{" "}
                  <strong>
                    {diasHastaVencimiento} día
                    {diasHastaVencimiento !== 1 ? "s" : ""}
                  </strong>
                  ({formatearFecha(pago.fechaVencimiento)}).
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Resumen financiero destacado mejorado */}
      <Card
        className={`border-0 shadow-lg bg-gradient-to-br ${estadoInfo.bgGradient}`}
      >
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl ${estadoInfo.iconBg}`}
                >
                  <DollarSign className={`h-6 w-6 ${estadoInfo.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Total a Pagar
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Monto final incluyendo ajustes
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-foreground">
                  {montoTotal.toFixed(2)}{" "}
                  <span className="text-2xl text-muted-foreground">
                    {pago.moneda || "USD"}
                  </span>
                </p>
                {(pago.descuento > 0 || pago.mora > 0) && (
                  <div className="flex items-center gap-4 text-sm">
                    {pago.descuento > 0 && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <TrendingDown className="h-4 w-4" />
                        <span>
                          Descuento: {pago.descuento.toFixed(2)}{" "}
                          {pago.moneda || "USD"}
                        </span>
                      </div>
                    )}
                    {pago.mora > 0 && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          Mora: {pago.mora.toFixed(2)} {pago.moneda || "USD"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {pago.estado === "pendiente" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setMostrarFormularioPago(true)}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Registrar Pago
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={imprimirComprobante}
                  disabled={isPrinting}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Printer className="h-5 w-5" />
                  {isPrinting ? "Preparando..." : "Imprimir"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid principal mejorado */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Información general */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
                <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Información del Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              icon={
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              }
              label="Concepto"
              value={pago.concepto}
              highlight={true}
              copyable={true}
            />

            <InfoItem
              icon={
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              }
              label="Descripción"
              value={pago.descripcion || "Sin descripción adicional"}
            />

            <Separator className="my-6" />

            <InfoItem
              icon={
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              }
              label="Estudiante"
              value={pago.estudiante?.name || "No asignado"}
              copyable={true}
            />

            <InfoItem
              icon={
                <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              }
              label="Grado/Sección"
              value={pago.estudiante?.grado || "No especificado"}
            />

            <InfoItem
              icon={
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              }
              label="Fecha de Emisión"
              value={formatearFecha(pago.fechaEmision)}
              tooltip="Fecha en que se generó este pago"
            />

            <InfoItem
              icon={
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              }
              label="Fecha Límite"
              value={formatearFecha(pago.fechaVencimiento)}
              variant={
                estaVencido
                  ? "error"
                  : diasHastaVencimiento <= 7
                  ? "warning"
                  : "default"
              }
              tooltip={
                estaVencido
                  ? "Este pago está vencido"
                  : diasHastaVencimiento <= 7
                  ? "Próximo a vencer"
                  : "Fecha límite de pago"
              }
            />
          </CardContent>
        </Card>

        {/* Detalles financieros */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-400/10">
                <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Detalles Financieros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              icon={
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              }
              label="Monto Base"
              value={`${pago.monto.toFixed(2)} ${pago.moneda || "USD"}`}
              copyable={true}
            />

            {pago.descuento > 0 && (
              <InfoItem
                icon={
                  <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                }
                label="Descuento Aplicado"
                value={`-${pago.descuento.toFixed(2)} ${pago.moneda || "USD"}`}
                variant="success"
                tooltip="Descuento aplicado al monto base"
              />
            )}

            {pago.mora > 0 && (
              <InfoItem
                icon={
                  <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                }
                label="Mora por Retraso"
                value={`+${pago.mora.toFixed(2)} ${pago.moneda || "USD"}`}
                variant="error"
                tooltip="Mora aplicada por pago tardío"
              />
            )}

            <Separator className="my-6" />

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
              <div className="relative">
                <InfoItem
                  icon={<Wallet className="h-5 w-5 text-primary" />}
                  label="Total Final"
                  value={`${montoTotal.toFixed(2)} ${pago.moneda || "USD"}`}
                  highlight={true}
                  copyable={true}
                  className="border-0 bg-transparent p-0"
                />
              </div>
            </div>

            {/* Progreso de pago */}
            {pago.estado === "pendiente" && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estado del pago</span>
                  <span className="font-medium">Pendiente</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Registra tu pago para actualizar el estado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información del pago realizado */}
      {pago.estado === "pagado" && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl text-green-800 dark:text-green-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-400/10">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Pago Completado
              <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 ml-auto">
                <Star className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              icon={
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              }
              label="Fecha de Pago"
              value={formatearFecha(pago.fechaPago)}
              copyable={true}
            />

            <InfoItem
              icon={
                <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
              }
              label="Método de Pago"
              value={pago.metodoPago || "No especificado"}
            />

            {pago.referenciaPago && (
              <InfoItem
                icon={
                  <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                }
                label="Referencia de Pago"
                value={pago.referenciaPago}
                copyable={true}
                tooltip="Número de referencia del pago"
              />
            )}

            {pago.observaciones && (
              <InfoItem
                icon={
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                }
                label="Observaciones"
                value={pago.observaciones}
              />
            )}

            {/* Progreso completado */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estado del pago</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  Completado
                </span>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ Pago verificado y procesado correctamente
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos adjuntos */}
      {pago.comprobantePago && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-400/10">
                <Archive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              Documentos Adjuntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 group-hover:bg-purple-500/20 transition-colors">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Comprobante de pago
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Documento adjunto • PDF
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver documento</TooltipContent>
                </Tooltip>
                <Button variant="outline" className="bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para registrar pago */}
      <Dialog
        open={mostrarFormularioPago}
        onOpenChange={setMostrarFormularioPago}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-primary">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              Registrar Pago
              <Badge variant="outline" className="ml-auto">
                <Shield className="h-3 w-3 mr-1" />
                Seguro
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Completa la información del pago realizado para actualizar el
              estado de la boleta.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <FormularioPagoRealizado
              pago={pago}
              onSubmit={handleRegistrarPago}
              isSubmitting={isSubmitting}
              onCancel={() => setMostrarFormularioPago(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
