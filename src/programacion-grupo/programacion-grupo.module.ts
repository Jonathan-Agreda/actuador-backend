import { Module } from '@nestjs/common';
import { ProgramacionGrupoController } from './programacion-grupo.controller';
import { ProgramacionGrupoService } from './programacion-grupo.service';
import { PrismaService } from '../data/prisma.service';

@Module({
  controllers: [ProgramacionGrupoController],
  providers: [ProgramacionGrupoService, PrismaService],
})
export class ProgramacionGrupoModule {}
