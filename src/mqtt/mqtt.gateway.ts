// src/mqtt/mqtt.gateway.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { ActuadoresService } from '../actuadores/actuadores.service';

@Controller()
export class MqttGateway {
  private readonly logger = new Logger(MqttGateway.name);

  constructor(private readonly actuadoresService: ActuadoresService) {}

  @EventPattern('actuadores/+/estado')
  async handleEstadoReporte(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic(); // actuadores/abc123/estado
    const apiKey = topic.split('/')[1];

    this.logger.log(
      `📩 MQTT estado recibido - apiKey: ${apiKey}, payload: ${JSON.stringify(data)}`,
    );

    // Aquí llamamos a la lógica de actualización
    await this.actuadoresService.actualizarEstadoPorApiKey(apiKey, data);
  }
}
