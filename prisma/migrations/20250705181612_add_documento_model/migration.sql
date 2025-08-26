/*
  Warnings:

  - You are about to drop the column `extension` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `fechaSubida` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `fechaVencimiento` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `fechaVerificacion` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `obligatorio` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `publico` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `ruta` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `tamaño` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `verificadoPor` on the `Documento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `Documento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigoVerificacion]` on the table `Documento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contenido` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emisorId` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Documento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TipoDocumento" ADD VALUE 'EXPEDIENTE';

-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Documento" DROP COLUMN "extension",
DROP COLUMN "fechaSubida",
DROP COLUMN "fechaVencimiento",
DROP COLUMN "fechaVerificacion",
DROP COLUMN "nombre",
DROP COLUMN "obligatorio",
DROP COLUMN "publico",
DROP COLUMN "ruta",
DROP COLUMN "tamaño",
DROP COLUMN "usuarioId",
DROP COLUMN "verificadoPor",
ADD COLUMN     "archivoUrl" TEXT,
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "codigoVerificacion" TEXT,
ADD COLUMN     "contenido" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "datosAdicionales" JSONB,
ADD COLUMN     "emisorId" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'activo',
ADD COLUMN     "estudianteId" TEXT,
ADD COLUMN     "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechaExpiracion" TIMESTAMP(3),
ADD COLUMN     "firmado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formato" TEXT NOT NULL DEFAULT 'PDF',
ADD COLUMN     "plantilla" TEXT,
ADD COLUMN     "titulo" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Documento_codigo_key" ON "Documento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_codigoVerificacion_key" ON "Documento"("codigoVerificacion");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
