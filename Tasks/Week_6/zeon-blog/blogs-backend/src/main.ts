import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { MetricsService } from './common/telemetry/metrics.service';
import { RequestTimingInterceptor } from './common/telemetry/request-timing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  const corsOrigin = process.env.CORS_ORIGIN;
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
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestTimingInterceptor(app.get(MetricsService)));
  app.enableCors({
    origin: corsOrigin, // Frontend dev port
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
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

  const samplerIntervalMs = Number(process.env.BENCHMARK_SAMPLER_INTERVAL_MS) || 0;
  if (samplerIntervalMs > 0) {
    setInterval(() => {
      const mem = process.memoryUsage();
      const cpu = process.cpuUsage();
      // eslint-disable-next-line no-console
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
