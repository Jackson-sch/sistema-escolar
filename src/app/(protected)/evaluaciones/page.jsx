import React from "react";

export default async function EvaluacionesPage() {
  const productos = await fetch("/sistema/pages/productos/index.php");
  const { data } = await productos.json();

  console.log("🚀 ~ EvaluacionesPage ~ data:", data)
  return <div>page</div>;
}
