// src/mqtt/mqtt.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: ClientProxy;
  private readonly logger = new Logger(MqttService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.MQTT,
      options: {
        url:
          this.configService.get<string>('MQTT_BROKER_URL') ||
          'mqtt://localhost:1883',
      },
    });

    this.client
      .connect()
      .then(() => this.logger.log('🟢 Conectado al broker MQTT'))
      .catch((err) => this.logger.error('🔴 Error conectando a MQTT', err));
  }

  getClient(): ClientProxy {
    return this.client;
  }
}
