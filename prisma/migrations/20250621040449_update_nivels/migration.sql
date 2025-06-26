/*
  Warnings:

  - You are about to drop the column `nivel` on the `AreaCurricular` table. All the data in the column will be lost.
  - You are about to drop the column `nivel` on the `Curso` table. All the data in the column will be lost.
  - You are about to drop the column `grado` on the `NivelAcademico` table. All the data in the column will be lost.
  - You are about to drop the column `nivel` on the `NivelAcademico` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo,institucionId]` on the table `AreaCurricular` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AreaCurricular_codigo_nivel_institucionId_key";

-- AlterTable
ALTER TABLE "AreaCurricular" DROP COLUMN "nivel";

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "nivel";

-- AlterTable
ALTER TABLE "NivelAcademico" DROP COLUMN "grado",
DROP COLUMN "nivel";

-- CreateIndex
CREATE UNIQUE INDEX "AreaCurricular_codigo_institucionId_key" ON "AreaCurricular"("codigo", "institucionId");
