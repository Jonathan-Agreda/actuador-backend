import { Module, forwardRef } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';
import { ActuadoresController } from './actuadores.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [WebsocketModule, forwardRef(() => MqttModule)],
  providers: [ActuadoresService],
  controllers: [ActuadoresController],
  exports: [ActuadoresService],
})
export class ActuadoresModule {}
