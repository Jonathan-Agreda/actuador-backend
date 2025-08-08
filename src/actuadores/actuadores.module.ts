import { Module, forwardRef } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';
import { ActuadoresController } from './actuadores.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { ActuadoresOfflineService } from './actuadores-offline.service';

@Module({
  imports: [WebsocketModule, forwardRef(() => MqttModule)],
  providers: [ActuadoresService, ActuadoresOfflineService],
  controllers: [ActuadoresController],
  exports: [ActuadoresService],
})
export class ActuadoresModule {}
