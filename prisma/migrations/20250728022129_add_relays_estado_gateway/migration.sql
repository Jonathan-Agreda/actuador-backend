/*
  Warnings:

  - You are about to drop the column `relayEncendido` on the `Actuador` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Actuador" DROP COLUMN "relayEncendido",
ADD COLUMN     "estadoGateway" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relays" JSONB,
ADD COLUMN     "ultimaActualizacion" TIMESTAMP(3);
