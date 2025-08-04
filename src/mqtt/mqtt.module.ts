// src/mqtt/mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttGateway } from './mqtt.gateway';
import { ActuadoresModule } from '../actuadores/actuadores.module';

@Module({
  imports: [ActuadoresModule],
  providers: [MqttService, MqttGateway],
  exports: [MqttService],
})
export class MqttModule {}
