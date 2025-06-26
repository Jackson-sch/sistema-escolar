"use client";

import * as React from "react";
import { Building } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useInstitucionContext } from "@/providers/institucion-provider";
import Image from "next/image";

export function TeamSwitcher() {
  const { info } = useInstitucionContext();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {info.logo ? (
              <img
                src={info.logo}
                alt="Logo institucional"
                className="object-contain"
                width={48}
                height={48}
              />
            ) : (
              <Building className="size-4" />
            )}
          </div>
          <div className="flex flex-col gap-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold capitalize">
              {info.nombre || "Institución"}
            </span>
            <span className="truncate text-xs font-mono">
              {info.codigoModular || "Configuración pendiente"}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
