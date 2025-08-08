import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../data/prisma.service';
import { WsGateway } from '../websocket/ws/ws.gateway';

@Injectable()
export class ActuadoresOfflineService {
  private readonly logger = new Logger(ActuadoresOfflineService.name);
  private readonly timeoutMs = Number(process.env.OFFLINE_TIMEOUT_MS ?? 35000); // 35s por defecto

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WsGateway,
  ) {}

  // Corre cada 20 segundos
  @Cron('*/20 * * * * *')
  async marcarOfflinePorInactividad() {
    const corte = new Date(Date.now() - this.timeoutMs);

    // 1) Buscar los que deben pasar a OFFLINE (evitamos reemitir los que ya están offline)
    const aCambiar = await this.prisma.actuador.findMany({
      where: {
        estado: { not: 'offline' },
        OR: [
          { ultimaActualizacion: null },
          { ultimaActualizacion: { lt: corte } },
        ],
      },
      include: { gateway: true },
    });

    if (!aCambiar.length) return;

    // 2) Update masivo
    await this.prisma.actuador.updateMany({
      where: {
        estado: { not: 'offline' },
        OR: [
          { ultimaActualizacion: null },
          { ultimaActualizacion: { lt: corte } },
        ],
      },
      data: { estado: 'offline', estadoGateway: 'caido' },
    });

    // 3) Emitir por WebSocket solo los que cambiaron
    this.wsGateway.emitirEstadosActualizados(
      aCambiar.map((act) => ({
        id: act.id,
        alias: act.alias,
        ip: act.ip,
        estado: 'offline',
        estadoGateway: 'caido',
        relays: act.relays,
        motorEncendido: act.motorEncendido,
        gateway: {
          alias: act.gateway?.alias ?? 'N/A',
          ip: act.gateway?.ip ?? 'N/A',
        },
        ultimaActualizacion: act.ultimaActualizacion,
      })),
    );

    this.logger.warn(`🔕 Marcados OFFLINE por inactividad: ${aCambiar.length}`);
  }
}
