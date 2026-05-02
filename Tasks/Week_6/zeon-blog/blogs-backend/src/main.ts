import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { RequestTimingInterceptor } from './common/telemetry/request-timing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  const corsOrigin = process.env.CORS_ORIGIN;
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = corsOrigin
    ? corsOrigin
        .split(',')
        .map((origin) => origin.trim().replace(/\/$/, ''))
        .filter(Boolean)
    : [];
  if (isProduction && allowedOrigins.length === 0) {
    throw new Error(
      'CORS_ORIGIN must be set in production (comma-separated origins).',
    );
  }
  app.setGlobalPrefix('api');
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
  app.useGlobalInterceptors(app.get(RequestTimingInterceptor));
  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header).
      if (!origin) {
        callback(null, true);
        return;
      }

      // In non-production, allow all browser origins when CORS_ORIGIN is not configured.
      if (!isProduction && allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS origin blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-client-id',
      'x-request-source',
      'x-request-id',
    ],
    exposedHeaders: ['x-request-id'],
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0.0')
    // .addBearerAuth() // enable if you use JWT
    .addSecurity('x-client-id', {
      type: 'apiKey',
      in: 'header',
      name: 'x-client-id',
      description: 'Client identifier header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // handy when using JWT
    },
  });

  const samplerIntervalMs =
    Number(process.env.BENCHMARK_SAMPLER_INTERVAL_MS) || 0;
  if (samplerIntervalMs > 0) {
    setInterval(() => {
      const mem = process.memoryUsage();
      const cpu = process.cpuUsage();

      console.log(
        JSON.stringify({
          type: 'runtime',
          ts: new Date().toISOString(),
          pid: process.pid,
          uptimeSec: process.uptime(),
          memory: mem,
          cpu,
        }),
      );
    }, samplerIntervalMs).unref();
  }

  await app.listen(port); // this should always be the last line in main.ts as it enables the website to start listening to requests; only call after everything is setup
  console.log(`API running on http://localhost:${port}/api/v1`);
}
bootstrap();
