/*
  Warnings:

  - A unique constraint covering the columns `[codigo,anioAcademico,gradoId]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo,anioAcademico,nivelId]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo,anioAcademico,institucionId]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[institucionId,nombre]` on the table `Nivel` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nivelAcademicoId` on table `Curso` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivelId` on table `NivelAcademico` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gradoId` on table `NivelAcademico` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AlcanceCurso" AS ENUM ('SECCION_ESPECIFICA', 'TODO_EL_GRADO', 'TODO_EL_NIVEL', 'TODO_LA_INSTITUCION');

-- DropForeignKey
ALTER TABLE "Curso" DROP CONSTRAINT "Curso_nivelAcademicoId_fkey";

-- DropForeignKey
ALTER TABLE "Grado" DROP CONSTRAINT "Grado_nivelId_fkey";

-- DropForeignKey
ALTER TABLE "NivelAcademico" DROP CONSTRAINT "NivelAcademico_gradoId_fkey";

-- DropForeignKey
ALTER TABLE "NivelAcademico" DROP CONSTRAINT "NivelAcademico_nivelId_fkey";

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "alcance" "AlcanceCurso" NOT NULL DEFAULT 'SECCION_ESPECIFICA',
ADD COLUMN     "institucionId" TEXT,
ADD COLUMN     "nivelId" TEXT,
ALTER COLUMN "nivelAcademicoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "NivelAcademico" ALTER COLUMN "nivelId" SET NOT NULL,
ALTER COLUMN "gradoId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_gradoId_key" ON "Curso"("codigo", "anioAcademico", "gradoId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_nivelId_key" ON "Curso"("codigo", "anioAcademico", "nivelId");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_anioAcademico_institucionId_key" ON "Curso"("codigo", "anioAcademico", "institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "Nivel_institucionId_nombre_key" ON "Nivel"("institucionId", "nombre");

-- AddForeignKey
ALTER TABLE "Grado" ADD CONSTRAINT "Grado_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "Grado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelAcademico" ADD CONSTRAINT "NivelAcademico_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_nivelAcademicoId_fkey" FOREIGN KEY ("nivelAcademicoId") REFERENCES "NivelAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
