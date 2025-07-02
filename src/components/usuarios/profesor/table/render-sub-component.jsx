"use client";

import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  GraduationCapIcon,
  BookIcon,
  DownloadIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  PrinterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/calculateAge";
import { formatDate } from "@/lib/formatDate";
import { calculateYearsOfService } from "@/lib/calculateYearsOfService";
import { handlePrint } from "@/lib/printUtils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const renderSubComponent = ({ row }) => {
  const profesor = row.original;
  console.log("Datos del profesor", profesor)

  // Función para obtener iniciales
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Componente para tarjetas bento
  const BentoCard = ({ title, children, className = "", large = false }) => (
    <div
      className={`
        relative rounded-lg border border-border/10 overflow-hidden bg-card/50
        transition-all duration-300 hover:bg-card/60 hover:border-border/20 shadow-sm
        ${large ? "col-span-2 row-span-2" : ""}
        ${className}
      `}
    >
      <div className="p-3">
        {title && (
          <h3 className="text-xs font-medium text-muted-foreground mb-2">
            {title}
          </h3>
        )}
        <div>{children}</div>
      </div>
    </div>
  );

  // Componente para estadísticas grandes
  const BigStat = ({ value, label }) => (
    <div>
      <h4 className="text-xs text-muted-foreground">{label}</h4>
      <div className="text-2xl font-bold text-foreground mt-0.5">{value}</div>
    </div>
  );

  // Componente para elementos de información con etiqueta y valor
  const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-2 mb-2 last:mb-0">
      {Icon && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
          <Icon className="h-3 w-3" />
        </div>
      )}
      <div className="flex-grow">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );

  // Componente para elementos de lista
  const ListItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/10 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );

  return (
    <div id="print-container" className="bg-muted/40 p-4 rounded-xl">
      {/* Encabezado con nombre y avatar - más compacto */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary capitalize">
          {getInitials(profesor.name)}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h2 className="text-base font-semibold text-foreground capitalize">
              {profesor.name}
            </h2>
            <CheckCircleIcon className="h-3 w-3 text-green-500" />
          </div>
          <Badge className="text-xs rounded-full px-2 py-0" variant="outline">
            {profesor.especialidad}
          </Badge>
        </div>
      </div>

      {/* Grid de tarjetas bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Años de servicio */}
        <BentoCard>
          <BigStat
            value={calculateYearsOfService(profesor.fechaContratacion).replace(
              " años",
              ""
            )}
            label="Años de servicio"
          />
        </BentoCard>

        {/* Edad */}
        <BentoCard>
          <BigStat
            value={calculateAge(profesor.fechaNacimiento)}
            label="Edad"
          />
        </BentoCard>

        {/* Fecha de contratación */}
        <BentoCard>
          <div className="flex items-center gap-1.5 mb-0.5">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Contratación</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {formatDate(profesor.fechaContratacion)}
          </p>
        </BentoCard>

        {/* Estado */}
        <BentoCard>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estado</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-foreground font-medium capitalize">
                {profesor.estado}
              </span>
            </div>
          </div>
          <div className="w-full bg-muted/30 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
        </BentoCard>

        {/* Información de Contacto */}
        <BentoCard title="Información de Contacto" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <InfoItem
              icon={MailIcon}
              label="Correo Electrónico"
              value={profesor.email}
            />
            <InfoItem
              icon={PhoneIcon}
              label="Teléfono"
              value={profesor.telefono.replace(
                /(\d{3})(\d{3})(\d{3})/,
                "$1 $2 $3"
              )}
            />
            <div className="col-span-2">
              <InfoItem
                icon={MapPinIcon}
                label="Dirección"
                value={profesor.direccion}
              />
            </div>
          </div>
        </BentoCard>

        {/* Información Académica */}
        <BentoCard title="Información Académica" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <BookIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Título</span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {profesor.titulo}
              </p>
            </div>
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCapIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Especialidad
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {profesor.especialidad}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Información Personal */}
        <BentoCard title="Información Personal" className="md:col-span-2">
          <div className="space-y-0">
            <ListItem label="DNI" value={profesor.dni} />
            <ListItem
              label="Código"
              value={
                profesor.dni.substring(0, 4) + "-" + profesor.dni.substring(4)
              }
            />
            <div className="grid grid-cols-3 gap-2">
              <ListItem
                label="Sexo"
                value={profesor.sexo}
              />
              <Separator orientation="vertical" />
              <ListItem
                label="Fecha de Nacimiento"
                value={formatDate(profesor.fechaNacimiento)}
              />
            </div>
          </div>
        </BentoCard>

        {/* Información del Sistema */}
        <BentoCard title="Información del Sistema" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ClipboardIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Registro</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(profesor.createdAt)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ClockIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Actualización
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(profesor.updatedAt)}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border/10">
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Datos verificados
              </span>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-border/10 no-print">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 rounded-full text-xs"
          onClick={() => handlePrint("print-container")}
        >
          <PrinterIcon className="h-3 w-3" />
          Imprimir
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 h-8 rounded-full text-xs"
        >
          <FileTextIcon className="h-3 w-3" />
          PDF
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 h-8 rounded-full text-xs"
        >
          <DownloadIcon className="h-3 w-3" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
