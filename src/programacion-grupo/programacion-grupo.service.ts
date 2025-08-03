// src/programacion-grupo/programacion-grupo.service.ts
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

@Injectable()
export class ProgramacionGrupoService {
  private readonly logger = new Logger(ProgramacionGrupoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProgramacionGrupoDto) {
    // ✅ Validar programación duplicada
    const conflicto = await this.prisma.programacionGrupo.findFirst({
      where: {
        grupoId: dto.grupoId,
        activo: true,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        dias: {
          hasSome: dto.dias ?? [], // al menos un día se repite
        },
      },
    });

    if (conflicto) {
      throw new BadRequestException(
        'Ya existe una programación activa con los mismos días y horario.',
      );
    }

    return this.prisma.programacionGrupo.create({
      data: {
        grupoId: dto.grupoId,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        frecuencia: dto.frecuencia,
        dias: dto.dias ?? [],
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
    const ahora = new Date();
    const horaActual = format(ahora, 'HH:mm');
    const diaActual = this.obtenerNombreDia(getDay(ahora)); // ej: "lunes"
    this.logger.log(
      `⌛ [CRON] Evaluando programaciones - hora actual: ${horaActual}, día: ${diaActual}`,
    );

    const programaciones = await this.prisma.programacionGrupo.findMany({
      where: { activo: true },
    });

    for (const prog of programaciones) {
      const debeEjecutar =
        (prog.frecuencia === 'diario' ||
          (prog.frecuencia === 'dias_especificos' &&
            prog.dias.includes(diaActual))) &&
        prog.horaInicio === horaActual;

      const debeApagar =
        (prog.frecuencia === 'diario' ||
          (prog.frecuencia === 'dias_especificos' &&
            prog.dias.includes(diaActual))) &&
        prog.horaFin === horaActual;

      if (debeEjecutar) {
        this.logger.log(
          `⏱ Ejecutando encendido de motor para grupo ${prog.grupoId}`,
        );
        await ejecutarAccionGrupal(this.prisma, prog.grupoId, 'encender');
      }

      if (debeApagar) {
        this.logger.log(
          `⏱ Ejecutando apagado de motor para grupo ${prog.grupoId}`,
        );
        await ejecutarAccionGrupal(this.prisma, prog.grupoId, 'apagar');
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
