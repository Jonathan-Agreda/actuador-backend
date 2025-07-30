import { Module } from '@nestjs/common';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { PrismaService } from '../data/prisma.service';

@Module({
  controllers: [GruposController],
  providers: [GruposService, PrismaService],
})
export class GruposModule {}
