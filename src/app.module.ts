import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActuadoresModule } from './actuadores/actuadores.module';
import { WebsocketModule } from './websocket/websocket.module';
import { WsGateway } from './websocket/ws/ws.gateway';
import { PrismaModule } from './data/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GruposModule } from './grupos/grupos.module';
import { ProgramacionGrupoModule } from './programacion-grupo/programacion-grupo.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ActuadoresModule,
    WebsocketModule,
    GruposModule,
    ProgramacionGrupoModule,
    MqttModule,
  ],
  controllers: [AppController],
  providers: [AppService, WsGateway],
})
export class AppModule {}
