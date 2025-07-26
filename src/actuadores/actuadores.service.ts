// src/actuadores/actuadores.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../data/prisma.service';
import { WsGateway } from '../websocket/ws/ws.gateway';
import * as ping from 'ping';
import { ConfigService } from '@nestjs/config';
import { CreateActuadorDto } from './dto/create-actuador.dto';

@Injectable()
export class ActuadoresService implements OnModuleInit {
  private readonly logger = new Logger(ActuadoresService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WsGateway,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando monitoreo automático de actuadores...');
    await this.actualizarEstados();
    const interval =
      Number(this.configService.get('MONITOR_INTERVAL_MS')) || 10_000;
    setInterval(() => this.actualizarEstados(), interval);
  }

  /** Obtiene todos los actuadores registrados */
  findAll() {
    return this.prisma.actuador.findMany({
      include: { gateway: true, empresa: true },
    });
  }

  /** Crea un actuador en la BD; genera apiKey si no se provee */
  async create(data: CreateActuadorDto) {
    const apiKey = data.apiKey ?? randomBytes(16).toString('hex');
    return this.prisma.actuador.create({
      data: { ...data, apiKey },
    });
  }

  /** Cambia el relé de un actuador */
  async toggle(id: string) {
    const actuador = await this.prisma.actuador.findUnique({ where: { id } });
    if (!actuador) throw new NotFoundException('Actuador no encontrado');

    const updated = await this.prisma.actuador.update({
      where: { id },
      data: { relayEncendido: !actuador.relayEncendido },
    });

    // Puedes emitir el cambio al frontend si lo necesitas:
    const estados = await this.generarEstados();
    this.wsGateway.emitirEstadosActualizados(estados);

    return updated;
  }

  /** Devuelve la lista de estados para enviar al WebSocket */
  /** Devuelve la lista de estados para enviar al WebSocket */
  private async generarEstados() {
    // Incluimos la relación gateway para no repetir consultas
    const actuadores = await this.prisma.actuador.findMany({
      include: { gateway: true },
    });

    return Promise.all(
      actuadores.map(async (act) => {
        // Ping al actuador
        let respuestaAct = { alive: false };
        try {
          respuestaAct = await ping.promise.probe(act.ip, { timeout: 2 });
        } catch (error) {
          this.logger.warn(
            `Falló el ping al actuador ${act.alias}: ${error.message}`,
          );
        }

        // Obtenemos la IP del gateway si existe
        const gatewayIp = act.gateway?.ip ?? null;
        let respuestaGw = { alive: false };

        // Si hay IP de gateway, hacemos el ping
        if (gatewayIp) {
          try {
            respuestaGw = await ping.promise.probe(gatewayIp, { timeout: 2 });
          } catch (error) {
            this.logger.warn(
              `Falló el ping al gateway ${gatewayIp}: ${error.message}`,
            );
          }
        }

        return {
          id: act.id,
          alias: act.alias,
          ip: act.ip,
          latitud: act.latitud,
          longitud: act.longitud,
          estado: respuestaAct.alive ? 'online' : 'offline',
          relayEncendido: act.relayEncendido,
          gateway: {
            ip: gatewayIp, // será string o null
            estado: respuestaGw.alive ? 'ok' : 'caido',
          },
        };
      }),
    );
  }

  /** Se ejecuta periódicamente para actualizar estados y emitirlos */
  private async actualizarEstados() {
    const estados = await this.generarEstados();
    // Opcional: actualizar el campo "estado" en la BD
    await Promise.all(
      estados.map(async (estado) => {
        const { id, estado: nuevoEstado } = estado;
        await this.prisma.actuador.update({
          where: { id },
          data: { estado: nuevoEstado },
        });
      }),
    );
    this.wsGateway.emitirEstadosActualizados(estados);
  }
}
