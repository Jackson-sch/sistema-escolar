import { redirect } from "next/navigation";
import { auth } from "@/auth";

import React from "react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
  
}
