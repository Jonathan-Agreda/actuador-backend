// src/mqtt/mqtt.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ActuadoresModule } from '../actuadores/actuadores.module';

@Module({
  imports: [forwardRef(() => ActuadoresModule)],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
