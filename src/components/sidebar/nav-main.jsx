"use client"

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link";

export function NavMain({ items }) {
  const pathname = usePathname();

  // Función para comprobar si un item o sus sub-items coinciden con la ruta actual
  const isItemActive = (item) => {
    // Si la URL del item coincide exactamente con la ruta actual
    if (item.url && pathname === item.url) {
      return true;
    }
    
    // Si el item tiene sub-items, comprobamos si alguno coincide con la ruta actual
    if (item.items && item.items.length > 0) {
      return item.items.some(subItem => {
        // Comprobamos si la ruta actual coincide exactamente o comienza con la URL del sub-item
        return pathname === subItem.url || 
               (subItem.url && pathname.startsWith(subItem.url));
      });
    }
    
    // Si la URL del item no es exactamente igual pero la ruta actual comienza con ella
    // (por ejemplo, item.url es '/brands' y pathname es '/brands/123')
    if (item.url && pathname.startsWith(item.url) && item.url !== '/') {
      return true;
    }
    
    return false;
  };

  // Función para comprobar si un sub-item está activo
  const isSubItemActive = (url) => {
    return pathname === url || (url && pathname.startsWith(url) && url !== '/');
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className={isItemActive(item) ? "bg-accent text-accent-foreground" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isActive = isSubItemActive(subItem.url);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            className={isActive ? "bg-accent text-accent-foreground" : ""}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                className={isItemActive(item) ? "bg-accent text-accent-foreground" : ""}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}