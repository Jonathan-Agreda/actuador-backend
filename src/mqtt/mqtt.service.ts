// src/mqtt/mqtt.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { ConfigService } from '@nestjs/config';
import { ActuadoresService } from '../actuadores/actuadores.service';
import {
  isValidEstadoPayload,
  normalizeEstadoPayload,
} from '../actuadores/validators/estado-lora.validator';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ActuadoresService))
    private readonly actuadoresService: ActuadoresService,
  ) {}

  onModuleInit() {
    const brokerUrl =
      this.configService.get<string>('MQTT_BROKER_URL') ||
      'mqtt://localhost:1883';

    this.client = connect(brokerUrl, {
      reconnectPeriod: 2000,
      keepalive: 60,
    });

    this.client.on('connect', () => {
      this.logger.log(`🟢 Conectado al broker MQTT: ${brokerUrl}`);

      // Suscripción a reportes de estado: actuadores/<apiKey>/estado
      this.client.subscribe('actuadores/+/estado', { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`❌ Error al suscribirse: ${err.message}`);
        } else {
          this.logger.log('📡 Suscrito a: actuadores/+/estado (QoS 1)');
        }
      });
    });

    this.client.on('reconnect', () =>
      this.logger.warn('🔄 Reintentando conexión MQTT...'),
    );
    this.client.on('close', () => this.logger.warn('🛑 Conexión MQTT cerrada'));
    this.client.on('error', (err) =>
      this.logger.error(`❌ Error MQTT: ${err.message}`),
    );

    this.registerMessageHandler();
  }

  /** Publicador genérico (mantiene tu firma con qos opcional) */
  publish(topic: string, payload: any, qos: 0 | 1 = 0) {
    const message =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (!this.client || !this.client.connected) {
      this.logger.warn(
        `⚠️ Cliente MQTT no conectado. No se publica en ${topic}`,
      );
      return;
    }
    this.client.publish(topic, message, { qos }, (err) => {
      if (err) {
        this.logger.error(`❌ Error al publicar en ${topic}: ${err.message}`);
      } else {
        this.logger.log(`📤 Publicado en ${topic}: ${message}`);
      }
    });
  }

  /** Manejo de mensajes entrantes */
  private registerMessageHandler() {
    this.client.on('message', async (topic, payloadBuffer) => {
      // Patrón esperado: actuadores/<apiKey>/estado
      const match = /^actuadores\/([^/]+)\/estado$/.exec(topic);
      if (!match) return;

      const apiKey = match[1];
      const payloadStr = payloadBuffer.toString();

      try {
        // 1) Validar que la apiKey exista en BD
        const exists = await this.actuadoresService.getActuadorByApiKey(apiKey);
        if (!exists) {
          this.logger.warn(`🔒 apiKey inválida: ${apiKey}. Ignorando mensaje.`);
          return;
        }

        // 2) Parsear JSON con manejo de error
        let data: any;
        try {
          data = JSON.parse(payloadStr);
        } catch {
          this.logger.warn(
            `⚠️ JSON inválido para ${apiKey}. Payload crudo: ${payloadStr}`,
          );
          return;
        }

        // 3) Validar estructura/tipos del payload
        if (!isValidEstadoPayload(data)) {
          this.logger.warn(`⚠️ Payload inválido para ${apiKey}: ${payloadStr}`);
          return;
        }

        // 4) Normalizar (defaults + timestamp epoch/ms)
        const normalized = normalizeEstadoPayload(data);

        if (normalized.estado === 'offline') {
          this.logger.warn(`🔕 Offline recibido para ${apiKey}`);
        }

        this.logger.log(`📩 Estado MQTT recibido de ${apiKey}`);
        this.logger.debug(`Topic: ${topic}`);
        this.logger.debug(`Payload: ${JSON.stringify(normalized)}`);

        // 5) Persistir en BD
        await this.actuadoresService.actualizarEstadoPorApiKey(
          apiKey,
          normalized,
        );

        this.logger.log(`✅ Estado actualizado para ${apiKey}`);
      } catch (err: any) {
        this.logger.error(
          `❌ Error procesando ${topic}: ${err?.message ?? err}`,
        );
      }
    });
  }
}
