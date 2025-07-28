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
import { ConfigService } from '@nestjs/config';
import { CreateActuadorDto } from './dto/create-actuador.dto';
import { ReporteEstadoDto } from './dto/reporte-estado.dto';
import { Relays } from './types/relays.type';

@Injectable()
export class ActuadoresService {
  private readonly logger = new Logger(ActuadoresService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WsGateway,
    private readonly configService: ConfigService,
  ) {}

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

    let relays: Relays = {
      releGateway: false,
      releValvula: false,
      releMotor1: false,
      releMotor2: false,
    };

    try {
      relays = JSON.parse(JSON.stringify(actuador.relays)) as Relays;
    } catch (e) {}

    const nuevoEstado = !relays.releGateway;

    const updated = await this.prisma.actuador.update({
      where: { id },
      data: {
        relays: {
          ...relays,
          releGateway: nuevoEstado,
        },
      },
    });

    this.wsGateway.emitirEstadosActualizados([
      {
        id: actuador.id,
        alias: actuador.alias,
        ip: actuador.ip,
        estado: actuador.estado,
        estadoGateway: actuador.estadoGateway,
        ultimaActualizacion: actuador.ultimaActualizacion,
        relays: {
          ...relays,
          releGateway: nuevoEstado,
        },
      },
    ]);

    return updated;
  }

  async reportarEstado(dto: ReporteEstadoDto) {
    const actuador = await this.prisma.actuador.findUnique({
      where: { apiKey: dto.apiKey },
    });

    if (!actuador) {
      throw new NotFoundException('Actuador no encontrado con esa API key');
    }

    await this.prisma.actuador.update({
      where: { id: actuador.id },
      data: {
        ip: dto.ip,
        estado: dto.estado,
        estadoGateway: dto.gatewayOnline,
        relays: dto.reles,
        ultimaActualizacion: new Date(dto.timestamp),
      },
    });

    // WebSocket opcional
    this.wsGateway.emitirEstadosActualizados([
      {
        id: actuador.id,
        ip: dto.ip,
        estado: dto.estado,
        estadoGateway: dto.gatewayOnline,
        relays: dto.reles,
        ultimaActualizacion: new Date(dto.timestamp),
      },
    ]);

    return { message: 'Estado actualizado correctamente' };
  }
}
