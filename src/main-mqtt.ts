import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.MQTT,
      options: {
        url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
      },
    },
  );

  await app.listen();
  console.log('🟢 Microservicio MQTT escuchando mensajes...');
}
bootstrap();
