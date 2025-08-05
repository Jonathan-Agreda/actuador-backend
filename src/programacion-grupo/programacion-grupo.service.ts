import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../data/prisma.service';
import { CreateProgramacionGrupoDto } from './dto/create-programacion-grupo.dto';
import { format, getDay } from 'date-fns';
import { ejecutarAccionGrupal } from '../utils/accionGrupal';
import { UpdateProgramacionDto } from './dto/update-programacion.dto';
import { MqttService } from '../mqtt/mqtt.service';

import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.tz.setDefault('America/Guayaquil');

@Injectable()
export class ProgramacionGrupoService {
  private readonly logger = new Logger(ProgramacionGrupoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mqttService: MqttService,
  ) {}

  async create(dto: CreateProgramacionGrupoDto) {
    const nuevasDias = dto.dias ?? [];

    const programaciones = await this.prisma.programacionGrupo.findMany({
      where: {
        grupoId: dto.grupoId,
        activo: true,
      },
    });

    const conflicto = programaciones.find((p) => {
      const diasSeCruzan =
        dto.frecuencia === 'diario' || p.frecuencia === 'diario'
          ? true
          : dto.frecuencia === 'una_vez' || p.frecuencia === 'una_vez'
            ? true
            : p.dias.some((d) => nuevasDias.includes(d));

      if (!diasSeCruzan) return false;

      const startA = dto.horaInicio;
      const endA = dto.horaFin;
      const startB = p.horaInicio;
      const endB = p.horaFin;

      const hayInterseccion = startA < endB && endA > startB;
      return hayInterseccion;
    });

    if (conflicto) {
      throw new BadRequestException(
        'Ya existe una programación activa con cruce de horario en los mismos días.',
      );
    }

    return this.prisma.programacionGrupo.create({
      data: {
        grupoId: dto.grupoId,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        frecuencia: dto.frecuencia,
        dias: nuevasDias,
        activo: dto.activo ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.programacionGrupo.findMany({
      include: { grupo: true },
    });
  }

  async remove(id: string) {
    const prog = await this.prisma.programacionGrupo.findUnique({
      where: { id },
    });

    if (!prog) {
      throw new NotFoundException('Programación no encontrada');
    }

    await this.prisma.programacionGrupo.delete({ where: { id } });
    return { message: 'Programación eliminada' };
  }

  async update(id: string, dto: UpdateProgramacionDto) {
    const prog = await this.prisma.programacionGrupo.findUnique({
      where: { id },
    });

    if (!prog) {
      throw new NotFoundException('Programación no encontrada');
    }

    return this.prisma.programacionGrupo.update({
      where: { id },
      data: {
        activo: dto.activo,
      },
    });
  }

  // 🕒 Cron que corre cada minuto
  @Cron('* * * * *')
  async ejecutarProgramaciones() {
    const ahora = dayjs().tz();
    const horaActual = ahora.format('HH:mm');
    const diaActual = this.obtenerNombreDia(getDay(ahora.toDate()));

    this.logger.log(
      `⌛ [CRON] Evaluando programaciones - hora actual: ${horaActual}, día: ${diaActual}`,
    );

    const programaciones = await this.prisma.programacionGrupo.findMany({
      where: { activo: true },
    });

    for (const prog of programaciones) {
      const frecuenciaValida =
        prog.frecuencia === 'diario' ||
        (prog.frecuencia === 'dias_especificos' &&
          prog.dias.includes(diaActual));

      if (!frecuenciaValida) continue;

      const hoy = ahora.format('YYYY-MM-DD');
      const inicio = dayjs.tz(`${hoy}T${prog.horaInicio}`, 'America/Guayaquil');
      const fin = dayjs.tz(`${hoy}T${prog.horaFin}`, 'America/Guayaquil');

      const esInicio = horaActual === prog.horaInicio;
      const esFin = horaActual === prog.horaFin;

      if (esInicio) {
        this.logger.log(
          `⏱ Ejecutando encendido de motor para grupo ${prog.grupoId}`,
        );
        await ejecutarAccionGrupal(
          this.prisma,
          this.mqttService,
          prog.grupoId,
          'encender',
        );
      }

      if (esFin) {
        this.logger.log(
          `⏱ Ejecutando apagado de motor para grupo ${prog.grupoId}`,
        );
        await ejecutarAccionGrupal(
          this.prisma,
          this.mqttService,
          prog.grupoId,
          'apagar',
        );
      }
    }
  }

  obtenerNombreDia(dia: number): string {
    const dias = [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
    ];
    return dias[dia];
  }
}
