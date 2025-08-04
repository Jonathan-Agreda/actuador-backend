import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { ConfigService } from '@nestjs/config';
import { ActuadoresService } from '../actuadores/actuadores.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly actuadoresService: ActuadoresService,
  ) {}

  onModuleInit() {
    const brokerUrl =
      this.configService.get<string>('MQTT_BROKER_URL') ||
      'mqtt://localhost:1883';

    this.client = connect(brokerUrl);

    this.client.on('connect', () => {
      this.logger.log('🟢 Conectado al broker MQTT');

      // ✅ Suscribirse al topic con wildcard
      this.client.subscribe('actuadores/+/estado', (err) => {
        if (err) {
          this.logger.error(`❌ Error al suscribirse al topic: ${err.message}`);
        } else {
          this.logger.log('📡 Suscrito a topic actuadores/+/estado');
        }
      });
    });

    // ✅ Escuchar mensajes
    this.client.on('message', async (topic, payloadBuffer) => {
      const payloadStr = payloadBuffer.toString();
      const apiKey = topic.split('/')[1]; // ej: actuadores/000/estado

      try {
        const data = JSON.parse(payloadStr);

        this.logger.log(`📩 MQTT estado recibido de ${apiKey}`);
        this.logger.debug(`Topic: ${topic}`);
        this.logger.debug(`Payload: ${JSON.stringify(data)}`);

        await this.actuadoresService.actualizarEstadoPorApiKey(apiKey, data);
      } catch (err) {
        this.logger.error(
          `❌ Error procesando mensaje de ${apiKey}: ${err.message}`,
        );
      }
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Error del cliente MQTT: ${err.message}`);
    });
  }
}
