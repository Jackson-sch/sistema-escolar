-- AlterTable
ALTER TABLE "AreaCurricular" ADD COLUMN     "creditos" INTEGER,
ADD COLUMN     "nivelId" TEXT,
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "AreaCurricular" ADD CONSTRAINT "AreaCurricular_nivelId_fkey" FOREIGN KEY ("nivelId") REFERENCES "Nivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaCurricular" ADD CONSTRAINT "AreaCurricular_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AreaCurricular"("id") ON DELETE SET NULL ON UPDATE CASCADE;
