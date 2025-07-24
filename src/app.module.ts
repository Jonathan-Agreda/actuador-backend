import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActuadoresModule } from './actuadores/actuadores.module';
import { WebsocketModule } from './websocket/websocket.module';
import { WsGateway } from './websocket/ws/ws.gateway';

@Module({
  imports: [ActuadoresModule, WebsocketModule],
  controllers: [AppController],
  providers: [AppService, WsGateway],
})
export class AppModule {}
