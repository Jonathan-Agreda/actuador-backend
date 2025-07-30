// src/grupos/grupos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../data/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  async crearGrupo(dto: CreateGrupoDto) {
    const { nombre, empresaId, loraIds } = dto;

    const loras = await this.prisma.actuador.findMany({
      where: {
        id: { in: loraIds },
      },
    });

    if (loras.length !== loraIds.length) {
      throw new NotFoundException('Uno o más Loras no existen');
    }

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
