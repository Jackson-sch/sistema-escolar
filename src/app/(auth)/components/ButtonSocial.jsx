"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export function ButtonSocial({ children, provider }) {
  const handleClick = async () => {
    await signIn(provider);
  };
  return (
    <Button variant="outline" onClick={handleClick} className="w-full">
      {children}
    </Button>
  );
}