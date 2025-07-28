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
import { BadRequestException } from '@nestjs/common';

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
      data: {
        ...data,
        apiKey,
        relays: {
          releGateway: false,
          releValvula: false,
          releMotor1: false,
          releMotor2: false,
        },
      },
    });
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
        motorEncendido: dto.motorEncendido,
        ultimaActualizacion: new Date(dto.timestamp),
      },
    });

    // WebSocket opcional
    this.wsGateway.emitirEstadosActualizados([
      {
        id: actuador.id,
        alias: actuador.alias,
        ip: dto.ip,
        estado: dto.estado,
        estadoGateway: dto.gatewayOnline,
        relays: dto.reles,
        motorEncendido: dto.motorEncendido,
        gateway: {
          alias: dto.gatewayAlias,
          ip: dto.gatewayIp,
        },
        ultimaActualizacion: new Date(dto.timestamp),
      },
    ]);

    return { message: 'Estado actualizado correctamente' };
  }

  async obtenerGatewayIp(apiKey: string) {
    const actuador = await this.prisma.actuador.findUnique({
      where: { apiKey },
      include: { gateway: true },
    });

    if (!actuador || !actuador.gateway) {
      throw new NotFoundException('Actuador o Gateway no encontrado');
    }

    return {
      gatewayAlias: actuador.gateway.alias,
      gatewayIp: actuador.gateway.ip,
    };
  }

  async reiniciarGateway(id: string) {
    const act = await this.prisma.actuador.findUnique({ where: { id } });

    if (!act) throw new NotFoundException('Actuador no encontrado');

    if (act.estadoGateway)
      throw new BadRequestException(
        'El gateway está en línea. No se puede reiniciar',
      );

    const relays = this.parseRelays(act);

    // Paso 1: APAGAR el releGateway
    relays.releGateway = false;
    await this.prisma.actuador.update({
      where: { id },
      data: { relays: relays as any },
    });
    this.logger.debug(`ReleGateway del actuador ${id} APAGADO`);
    this.emitirEstado(id);

    // Paso 2: Encenderlo nuevamente luego de 5s
    setTimeout(async () => {
      relays.releGateway = true;
      await this.prisma.actuador.update({
        where: { id },
        data: { relays: relays as any },
      });
      this.logger.debug(`ReleGateway del actuador ${id} ENCENDIDO`);
      this.emitirEstado(id);
    }, 5000);

    return { message: 'Reinicio de gateway iniciado' };
  }

  async encenderMotor(id: string) {
    const act = await this.prisma.actuador.findUnique({ where: { id } });
    if (!act) throw new NotFoundException('Actuador no encontrado');

    const relays = this.parseRelays(act);
    relays.releValvula = false;
    relays.releMotor1 = true;
    relays.releMotor2 = true;

    await this.prisma.actuador.update({
      where: { id },
      data: { relays: relays as any },
    });
    this.emitirEstado(id);

    setTimeout(async () => {
      relays.releMotor2 = false;
      await this.prisma.actuador.update({
        where: { id },
        data: { relays: relays as any },
      });
      this.emitirEstado(id);
    }, 5000);

    return { message: 'Encendido de motor ejecutado' };
  }

  async apagarMotor(id: string) {
    const act = await this.prisma.actuador.findUnique({ where: { id } });
    if (!act) throw new NotFoundException('Actuador no encontrado');

    const relays = this.parseRelays(act);
    relays.releValvula = true;
    relays.releMotor1 = false;

    await this.prisma.actuador.update({
      where: { id },
      data: { relays: relays as any },
    });
    this.emitirEstado(id);

    return { message: 'Apagado de motor ejecutado' };
  }

  private async emitirEstado(actuadorId: string) {
    const act = await this.prisma.actuador.findUnique({
      where: { id: actuadorId },
      include: { gateway: true },
    });

    if (!act) return;

    this.wsGateway.emitirEstadosActualizados([
      {
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
      },
    ]);
    this.logger.debug(`Emitido estado por WebSocket para actuador ${act.id}`);
  }

  private parseRelays(act: any): Relays {
    let relays: Relays = {
      releGateway: false,
      releValvula: false,
      releMotor1: false,
      releMotor2: false,
    };

    if (act.relays) {
      try {
        relays = JSON.parse(JSON.stringify(act.relays)) as Relays;
      } catch (e) {
        this.logger.warn(
          `No se pudo parsear relays del actuador ${act.id}, usando valores por defecto`,
        );
      }
    } else {
      this.logger.warn(
        `Actuador ${act.id} no tiene relays definidos, usando valores por defecto`,
      );
    }

    return relays;
  }
}
