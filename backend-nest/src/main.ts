import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const rawPort = config.get<string>('PORT');
  const port = rawPort ? Number(rawPort) : 3000;
  await app.listen(Number.isFinite(port) ? port : 3000);
}

bootstrap();
