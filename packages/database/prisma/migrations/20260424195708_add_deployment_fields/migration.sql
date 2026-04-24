-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deploySlug" TEXT,
ADD COLUMN     "deployType" TEXT,
ADD COLUMN     "deployUrl" TEXT,
ADD COLUMN     "deployedAt" TIMESTAMP(3),
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Project_deploySlug_idx" ON "Project"("deploySlug");

-- CreateIndex
CREATE INDEX "Project_isPublic_idx" ON "Project"("isPublic");
