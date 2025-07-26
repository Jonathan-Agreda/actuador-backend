-- CreateTable
CREATE TABLE "Actuador" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "ip" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'offline',
    "relayEncendido" BOOLEAN NOT NULL DEFAULT false,
    "gatewayId" TEXT,
    "empresaId" TEXT,

    CONSTRAINT "Actuador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gateway" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ok',

    CONSTRAINT "Gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT,
    "direccion" TEXT,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoActuador" (
    "grupoId" TEXT NOT NULL,
    "actuadorId" TEXT NOT NULL,

    CONSTRAINT "GrupoActuador_pkey" PRIMARY KEY ("grupoId","actuadorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Actuador_apiKey_key" ON "Actuador"("apiKey");

-- CreateIndex
CREATE INDEX "Actuador_gatewayId_idx" ON "Actuador"("gatewayId");

-- CreateIndex
CREATE INDEX "Actuador_empresaId_idx" ON "Actuador"("empresaId");

-- AddForeignKey
ALTER TABLE "Actuador" ADD CONSTRAINT "Actuador_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "Gateway"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actuador" ADD CONSTRAINT "Actuador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoActuador" ADD CONSTRAINT "GrupoActuador_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoActuador" ADD CONSTRAINT "GrupoActuador_actuadorId_fkey" FOREIGN KEY ("actuadorId") REFERENCES "Actuador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
