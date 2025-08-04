// src/mqtt/mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ActuadoresModule } from '../actuadores/actuadores.module';

@Module({
  imports: [ActuadoresModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
