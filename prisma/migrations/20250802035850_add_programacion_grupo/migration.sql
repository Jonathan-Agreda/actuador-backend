-- CreateTable
CREATE TABLE "ProgramacionGrupo" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "dias" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramacionGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramacionGrupo_grupoId_idx" ON "ProgramacionGrupo"("grupoId");

-- AddForeignKey
ALTER TABLE "ProgramacionGrupo" ADD CONSTRAINT "ProgramacionGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
