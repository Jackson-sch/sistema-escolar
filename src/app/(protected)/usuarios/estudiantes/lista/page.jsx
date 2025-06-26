import EstudianteTable from "@/components/estudiante/table/estudiante-table";
import { columns } from "@/components/estudiante/table/columns";
import { db } from "@/lib/db";

export default async function ListaPage() {
  const students = await db.user.findMany({
    where: { role: "estudiante" },
    include: {
      nivelAcademico: {
        select: {
          nivel: true,
          grado: true,
          seccion: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto">
      <EstudianteTable columns={columns} data={students} />
    </div>
  );
}
