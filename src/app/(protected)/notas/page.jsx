import NotaTable from "./table/nota-table";
import { getNotasPorProfesor } from "@/action/notas/nota";
import ModalRegistrarNota from "./table/ModalRegistrarNota";

export default async function NotasPage() {
  const notas = await getNotasPorProfesor();
  // El estado y el modal se manejarán en el cliente, así que el botón y el modal deben estar en un componente cliente
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Registro de Notas</h1>
        <ModalRegistrarNota />
      </div>
      <NotaTable notas={notas} />
    </div>
  );
}
