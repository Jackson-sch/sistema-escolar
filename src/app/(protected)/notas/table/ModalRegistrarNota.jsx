"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ModalRegistrarNota() {
  const [form, setForm] = useState({
    estudiante: "",
    curso: "",
    evaluacion: "",
    valor: "",
    comentario: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica para guardar la nota
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Registrar Nota
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nueva Nota</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar una nueva nota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <input
            name="estudiante"
            placeholder="Estudiante"
            className="w-full border px-2 py-1 rounded"
            value={form.estudiante}
            onChange={handleChange}
            required
          />
          <input
            name="curso"
            placeholder="Curso"
            className="w-full border px-2 py-1 rounded"
            value={form.curso}
            onChange={handleChange}
            required
          />
          <input
            name="evaluacion"
            placeholder="Evaluación"
            className="w-full border px-2 py-1 rounded"
            value={form.evaluacion}
            onChange={handleChange}
            required
          />
          <input
            name="valor"
            placeholder="Nota"
            type="number"
            className="w-full border px-2 py-1 rounded"
            value={form.valor}
            onChange={handleChange}
            required
          />
          <textarea
            name="comentario"
            placeholder="Comentario"
            className="w-full border px-2 py-1 rounded"
            value={form.comentario}
            onChange={handleChange}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2" onClick={() => {}}>
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
