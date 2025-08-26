/*
  Warnings:

  - You are about to drop the column `registradoPor` on the `Asistencia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asistencia" DROP COLUMN "registradoPor",
ADD COLUMN     "registradoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
