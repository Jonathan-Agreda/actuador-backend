import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as ping from 'ping';
import { actuadoresMock } from './mocks/actuadores.mock';
import { WsGateway } from '../websocket/ws/ws.gateway'; // 👈 importante

@Injectable()
export class ActuadoresService implements OnModuleInit {
  private readonly logger = new Logger(ActuadoresService.name);
  private estadosActuales: any[] = [];

  constructor(private readonly wsGateway: WsGateway) {} // 👈 importante

  async onModuleInit() {
    this.logger.log('Iniciando monitoreo automático de actuadores...');
    await this.actualizarEstados();
    setInterval(() => this.actualizarEstados(), 10_000);
  }

  private async actualizarEstados() {
    const resultados = await Promise.all(
      actuadoresMock.map(async (actuador) => {
        const respuestaActuador = await ping.promise.probe(actuador.ip, {
          timeout: 2,
        });
        const respuestaGateway = await ping.promise.probe(actuador.gateway.ip, {
          timeout: 2,
        });

        return {
          ...actuador,
          estado: respuestaActuador.alive ? 'online' : 'offline',
          gateway: {
            ...actuador.gateway,
            estado: respuestaGateway.alive ? 'ok' : 'caido',
          },
        };
      }),
    );

    this.estadosActuales = resultados;
    this.logger.log('Estados actualizados y enviados por WebSocket');

    // 👇 Emitir a frontend
    this.wsGateway.emitirEstadosActualizados(this.estadosActuales);
  }

  obtenerEstados() {
    return this.estadosActuales;
  }
}
