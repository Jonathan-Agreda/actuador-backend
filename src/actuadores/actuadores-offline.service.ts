import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../data/prisma.service';
import { WsGateway } from '../websocket/ws/ws.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ActuadoresOfflineService {
  private readonly logger = new Logger(ActuadoresOfflineService.name);
  private readonly timeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WsGateway,
    private readonly config: ConfigService,
  ) {
    this.timeoutMs = Number(this.config.get('OFFLINE_TIMEOUT_MS') ?? 35000); // 35s por defecto
  }

  // Corre cada 20 segundos
  @Cron('*/20 * * * * *')
  async marcarOfflinePorInactividad() {
    try {
      const corte = new Date(Date.now() - this.timeoutMs);

      // A) Candidatos (solo IDs) para minimizar carga
      const candidates = await this.prisma.actuador.findMany({
        where: {
          estado: { not: 'offline' },
          OR: [
            { ultimaActualizacion: null },
            { ultimaActualizacion: { lt: corte } },
          ],
        },
        select: { id: true },
      });
      if (!candidates.length) return;

      const ids = candidates.map((c) => c.id);

      // B) Update atómico solo si siguen vencidos (evita condiciones de carrera)
      const { count } = await this.prisma.actuador.updateMany({
        where: {
          id: { in: ids },
          estado: { not: 'offline' },
          OR: [
            { ultimaActualizacion: null },
            { ultimaActualizacion: { lt: corte } },
          ],
        },
        data: { estado: 'offline', estadoGateway: 'caido' },
      });
      if (!count) return;

      // C) Leer SOLO los que realmente quedaron offline para emitir por WS
      const updated = await this.prisma.actuador.findMany({
        where: { id: { in: ids }, estado: 'offline' },
        include: { gateway: true },
      });
      if (!updated.length) return;

      this.wsGateway.emitirEstadosActualizados(
        updated.map((act) => ({
          id: act.id,
          alias: act.alias,
          ip: act.ip,
          estado: act.estado,
          estadoGateway: act.estadoGateway,
          relays: act.relays,
          motorEncendido: act.motorEncendido,
          gateway: {
            alias: act.gateway?.alias ?? 'N/A',
            ip: act.gateway?.ip ?? 'N/A',
          },
          ultimaActualizacion: act.ultimaActualizacion,
        })),
      );

      this.logger.warn(`🔕 Marcados OFFLINE por inactividad: ${count}`);
    } catch (e: any) {
      this.logger.error(`Offline cron error: ${e?.message ?? e}`);
    }
  }
}
