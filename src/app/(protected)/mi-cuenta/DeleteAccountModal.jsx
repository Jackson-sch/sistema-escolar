import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

function getRandomWord() {
  const palabras = [
    "CONFIRMAR",
    "ELIMINAR",
    "BORRAR",
    "ACEPTAR",
    "SEGURO",
    "FINALIZAR",
    "CONTINUAR",
    "DEFINITIVO",
  ];
  return palabras[Math.floor(Math.random() * palabras.length)];
}

export default function DeleteAccountModal({ userId }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState("");

  const handleOpen = () => {
    setWord(getRandomWord());
    setInput("");
    setOpen(true);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Cuenta eliminada correctamente" });
        window.location.href = "/";
      } else {
        toast({
          title: data.error || "Error al eliminar la cuenta",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error de red al eliminar la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <Button variant="destructive" onClick={handleOpen}>
        Eliminar mi cuenta
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-red-600">
              Eliminar cuenta
            </h2>
            <p className="mb-4 text-gray-700">
              Esta acción es irreversible. Para confirmar, escribe la siguiente
              palabra exactamente como aparece:
            </p>
            <div className="mb-4 p-2 bg-gray-100 rounded text-center font-bold text-lg tracking-widest select-none">
              {word}
            </div>
            <form onSubmit={handleDelete}>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded mb-4 text-center"
                placeholder="Escribe la palabra de confirmación"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={loading || input !== word}
                >
                  {loading ? "Eliminando..." : "Eliminar cuenta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
