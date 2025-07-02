-- CreateTable
CREATE TABLE "CargoPermiso" (
    "id" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CargoPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CargoPermiso_cargo_idx" ON "CargoPermiso"("cargo");

-- CreateIndex
CREATE INDEX "CargoPermiso_permisoId_idx" ON "CargoPermiso"("permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "CargoPermiso_cargo_permisoId_key" ON "CargoPermiso"("cargo", "permisoId");

-- AddForeignKey
ALTER TABLE "CargoPermiso" ADD CONSTRAINT "CargoPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
