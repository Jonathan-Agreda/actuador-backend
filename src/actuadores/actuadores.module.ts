import { Module } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';
import { ActuadoresController } from './actuadores.controller';

@Module({
  providers: [ActuadoresService],
  controllers: [ActuadoresController]
})
export class ActuadoresModule {}
