"use client";
import React, { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatear la hora en formato 12 horas
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  // Formatear la fecha
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date = time.toLocaleDateString("es-ES", options);

  return (
    <div className="flex-col items-center justify-center hidden md:flex  px-6">
      {/* Contenedor del reloj */}
      <div className="flex items-baseline space-x-4">
        {/* Horas */}
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-primary">{hours}</span>
        </div>

        {/* Separador parpadeante */}
        <span className="text-xl font-bold text-primary animate-pulse">:</span>

        {/* Minutos */}
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-primary">{minutes}</span>
        </div>

        {/* Separador parpadeante */}
        <span className="text-xl font-bold text-primary animate-pulse">:</span>

        {/* Segundos */}
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-primary">{seconds}</span>
        </div>
      </div>

      {/* Fecha */}
      <div className="text-xs capitalize">{date}</div>
    </div>
  );
}