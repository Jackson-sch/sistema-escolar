"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import data from "./route";
import { Fragment, useMemo } from "react";


export default function DynamicBreadcrumb() {
  const pathname = usePathname();

  const getActiveRoutes = (routes, path) => {
    const activeRoutes = [];
    
    if (!Array.isArray(routes)) return activeRoutes;

    for (const route of routes) {
      // Buscar coincidencia exacta en los items
      if (Array.isArray(route.items)) {
        const activeChild = route.items.find((item) => 
          item.url !== "#" && path === item.url
        );

        if (activeChild) {
          // Si encontramos una coincidencia exacta, agregamos la ruta padre y el hijo
          activeRoutes.push({
            title: route.title,
            url: route.url
          });
          activeRoutes.push(activeChild);
          break;
        }

        // Si no hay coincidencia exacta, verificamos si estamos en una subruta
        const activeSubRoute = route.items.find((item) => 
          item.url !== "#" && path.startsWith(item.url)
        );

        if (activeSubRoute) {
          activeRoutes.push({
            title: route.title,
            url: route.url
          });
          activeRoutes.push(activeSubRoute);
          break;
        }
      }
    }
    
    return activeRoutes;
  };

  
  const activeRoutes = useMemo(() => {
    const routes = getActiveRoutes(data.navMain, pathname);
    return routes;
  }, [pathname]);

  // No mostrar breadcrumb si estamos en la raíz o no hay rutas activas
  if (pathname === "/" || activeRoutes.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Inicio</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {activeRoutes.map((route, index) => (
          <Fragment key={`${route.url}-${index}`}>
            <BreadcrumbItem>
              {index === activeRoutes.length - 1 || route.url === "#" ? (
                <BreadcrumbPage>{route.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={route.url !== "#" ? route.url : pathname}>
                    {route.title}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < activeRoutes.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}