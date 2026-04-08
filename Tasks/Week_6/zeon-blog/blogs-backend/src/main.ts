import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

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
  await app.listen(port); // this should always be the last line in main.ts as it enables the website to start listening to requests; only call after everything is setup
  console.log(`API running on http://localhost:${port}/api/v1}`);
}
bootstrap();