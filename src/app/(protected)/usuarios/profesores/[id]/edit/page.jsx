import { getProfesor, getProfesores } from "@/action/profesor/profesor";
import ProfesorFormulario from "@/components/profesor/formulario";
import { db } from "@/lib/db";

export default async function page({ params }) {
  const { id } = params;
  /*  const profesor = await getProfesor(id); */
  const data = await db.user.findFirst({
    where: {
      id: id,
    },
  });
  console.log("🚀 ~ page ~ data:", data);

  return <ProfesorFormulario profesorData={data} />;
}
