// src/grupos/grupos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../data/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  async crearGrupo(dto: CreateGrupoDto) {
    const { nombre, empresaId, loraIds } = dto;

    // Verificar que todos los IDs existan
    const loras = await this.prisma.actuador.findMany({
      where: {
        id: { in: loraIds },
      },
    });

    if (loras.length !== loraIds.length) {
      throw new NotFoundException('Uno o más Loras no existen');
    }

    // ✅ Verificar si ya están asignados a otro grupo
    const lorasOcupadas = await this.prisma.actuador.findMany({
      where: {
        id: { in: loraIds },
        GrupoActuador: {
          some: {}, // Si ya tiene alguna relación con grupo
        },
      },
      select: {
        id: true,
        alias: true,
      },
    });

    if (lorasOcupadas.length > 0) {
      const nombres = lorasOcupadas.map((l) => l.alias).join(', ');
      throw new BadRequestException(
        `Los siguientes Loras ya pertenecen a un grupo: ${nombres}`,
      );
    }

    // ✅ Crear el grupo si todo está correcto
    return await this.prisma.grupo.create({
      data: {
        nombre,
        empresa: { connect: { id: empresaId } },
        GrupoActuador: {
          create: loraIds.map((id) => ({
            actuador: { connect: { id } },
          })),
        },
      },
      include: {
        GrupoActuador: {
          include: {
            actuador: true,
          },
        },
      },
    });
  }

  async obtenerTodos() {
    return await this.prisma.grupo.findMany({
      include: {
        GrupoActuador: {
          include: {
            actuador: true,
          },
        },
        empresa: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async eliminarGrupo(id: string) {
    // ✅ Eliminar relaciones primero
    await this.prisma.grupoActuador.deleteMany({
      where: { grupoId: id },
    });

    // ✅ Luego eliminar el grupo
    return await this.prisma.grupo.delete({
      where: { id },
    });
  }
}
