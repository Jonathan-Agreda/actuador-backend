import { Module } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';
import { ActuadoresController } from './actuadores.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  providers: [ActuadoresService],
  controllers: [ActuadoresController],
})
export class ActuadoresModule {}
