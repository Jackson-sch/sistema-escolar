"use client";
import React, { useEffect, useState } from "react";
import { get } from "react-hook-form";
import { getAsignaturas } from "./api";

export default function AsignaturaPage() {
  const [asignaturas, setAsignaturas] = useState([]);

  useEffect(() => {
    async function fetchAsignaturas() {
      const response = await getAsignaturas();
      setAsignaturas(response);
    }
    fetchAsignaturas();
  }, []);

  return (
    <div>
      <h1>Asignaturas</h1>
      <div className="container mx-auto grid gap-4">
        {asignaturas.map((asignatura) => (
          <div
            key={asignatura.id}
            className="border border-gray-200 p-4 flex gap-4 shadow rounded hover:scale-105"
          >
            <span>{asignatura.codigo}</span>
            <span>{asignatura.nombre}</span>
            <p>{asignatura.descripcion}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const newAsignatura = {
            codigo: formData.get("codigo"),
            nombre: formData.get("nombre"),
            descripcion: formData.get("descripcion"),
          };
          // Assuming you have an API endpoint to handle the creation of a new asignatura
          await fetch("/api/asignatura", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newAsignatura),
          });
          // Refresh the list of asignaturas
          const response = await getAsignaturas();
          setAsignaturas(response);
        }}
        className="mt-8 container mx-auto grid grid-cols-2"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="codigo"
          >
            Código
          </label>
          <input
            type="text"
            name="codigo"
            id="codigo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="nombre"
          >
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="descripcion"
          >
            Descripción
          </label>
          <textarea
            name="descripcion"
            id="descripcion"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Registrar Asignatura
        </button>
      </form>
    </div>
  );
}
