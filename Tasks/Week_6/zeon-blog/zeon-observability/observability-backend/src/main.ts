import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 5100;
  const configuredOrigins = process.env.CORS_ORIGIN
    ?.split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const corsOrigins =
    configuredOrigins && configuredOrigins.length
      ? configuredOrigins
      : process.env.NODE_ENV === 'production'
        ? null
        : ['http://localhost:5180'];

  if (!corsOrigins) {
    throw new Error(
      'CORS_ORIGIN is required in production for observability-backend.',
    );
  }

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.useGlobalFilters(app.get(HttpExceptionFilter));

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  });

  await app.listen(port);
  console.log(`Observability API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
