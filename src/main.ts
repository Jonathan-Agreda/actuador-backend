import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Configura el pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ignora propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
      transform: true, // convierte tipos primitivos (string a number, etc.)
    }),
  );

  // ✅ Habilita CORS para permitir peticiones desde localhost:3000
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.0.104:3000'],
    credentials: true,
  });

  // ✅ Prefijo global para todas las rutas
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
