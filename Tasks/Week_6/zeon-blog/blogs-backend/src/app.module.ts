import { ClassSerializerInterceptor, Module, UseInterceptors } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './health/health.module';
import { BlogsModule } from './modules/Blogs/blogs.module';
import { UsersModule } from './modules/Users/users.module';
import { AuthModule } from './modules/Auth/auth.module';
import { UploadModule } from './modules/Upload/upload.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { MetricsService } from './common/telemetry/metrics.service';

@UseInterceptors(ClassSerializerInterceptor)
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, //auto-create schema: NEVER USE DURING PROD
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'lib', 'store'),
      serveRoot: '/v1/uploads',
    }),
    HealthModule, BlogsModule, UsersModule, AuthModule, UploadModule, DiagnosticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, MetricsService],
})
export class AppModule { }
