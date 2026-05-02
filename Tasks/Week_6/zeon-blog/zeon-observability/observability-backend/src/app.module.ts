import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AuthModule } from './common/auth/auth.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { QueryModule } from './modules/query/query.module';
import { CorrelationModule } from './modules/correlation/correlation.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        'zeon-observability/.env',
        'zeon-observability/observability-backend/.env',
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.OBS_DB_HOST || process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.OBS_DB_PORT || process.env.DB_PORT || 3306),
      username:
        process.env.OBS_DB_USERNAME || process.env.DB_USERNAME || 'root',
      password: process.env.OBS_DB_PASSWORD || process.env.DB_PASSWORD || '',
      database:
        process.env.OBS_DB_NAME || process.env.DB_NAME || 'zeon_observability',
      autoLoadEntities: true,
      synchronize: process.env.OBS_DB_SYNCHRONIZE === '1',
    }),
    AuthModule,
    IngestionModule,
    QueryModule,
    CorrelationModule,
    DiagnosticsModule,
  ],
  controllers: [AppController],
  providers: [HttpExceptionFilter],
})
export class AppModule {}
