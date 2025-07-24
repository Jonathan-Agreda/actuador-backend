import { Module } from '@nestjs/common';
import { WsGateway } from './ws/ws.gateway';

@Module({
  providers: [WsGateway]
})
export class WebsocketModule {}
