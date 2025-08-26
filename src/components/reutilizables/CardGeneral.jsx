import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/utils"; // Asumiendo que utilizas shadcn/ui
// Si no tienes cn, puedes importar clsx directamente:
// import clsx from "clsx";

export default function CardGeneral({
  children,
  title,
  description,
  className,
  cardHeaderClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
}) {
  return (
    <Card
      className={cn(
        "w-full max-w-sm mx-auto sm:max-w-lg md:max-w-xl lg:max-w-full mb-4 ",
        className
      )}
    >
      <CardHeader className={cn(cardHeaderClassName, "p-0 sm:p-4")}>
        <CardTitle className={cn("text-xl sm:text-2xl", titleClassName)}>
          {title}
        </CardTitle>
        <CardDescription className={cn(descriptionClassName)}>
          <p className="text-xs sm:text-sm">{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          "min-h-[600px]",
          "max-h-dvh-[calc(100vh-200px)]",
          "transition-all duration-300 ease-in-out p-0 sm:p-4",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
