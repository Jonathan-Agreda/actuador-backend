import { Module } from '@nestjs/common';
import { ProgramacionGrupoController } from './programacion-grupo.controller';
import { ProgramacionGrupoService } from './programacion-grupo.service';
import { PrismaService } from '../data/prisma.service';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [ProgramacionGrupoController],
  providers: [ProgramacionGrupoService, PrismaService],
})
export class ProgramacionGrupoModule {}
