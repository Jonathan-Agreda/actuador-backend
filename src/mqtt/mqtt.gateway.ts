// src/mqtt/mqtt.gateway.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { ActuadoresService } from '../actuadores/actuadores.service';

@Controller()
export class MqttGateway {
  private readonly logger = new Logger(MqttGateway.name);

  constructor(private readonly actuadoresService: ActuadoresService) {
    this.logger.log('✅ MqttGateway cargado correctamente');
  }

  @EventPattern('actuadores/+/estado')
  async handleEstadoReporte(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic(); // Ej: actuadores/55cd2d46.../estado
    const apiKey = topic.split('/')[1];

    this.logger.log('📩 MQTT estado recibido');
    this.logger.debug(`Topic: ${topic}`);
    this.logger.debug(`apiKey extraída: ${apiKey}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);

    try {
      await this.actuadoresService.actualizarEstadoPorApiKey(apiKey, data);
    } catch (err) {
      this.logger.error(
        `❌ Error procesando MQTT estado de ${apiKey}: ${err.message}`,
      );
    }
  }
}
