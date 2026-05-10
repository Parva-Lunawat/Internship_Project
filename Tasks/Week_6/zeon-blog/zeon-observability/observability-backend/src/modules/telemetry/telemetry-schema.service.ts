import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

const TABLES = ['obs_metrics', 'obs_logs', 'obs_events', 'obs_traces'];

@Injectable()
export class TelemetrySchemaService implements OnModuleInit {
  private readonly logger = new Logger(TelemetrySchemaService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.ensureSourceServiceColumns();
  }

  private async tableExists(tableName: string) {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName],
    );
    return Number(rows?.[0]?.count ?? 0) > 0;
  }

  private async columnExists(tableName: string, columnName: string) {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [tableName, columnName],
    );
    return Number(rows?.[0]?.count ?? 0) > 0;
  }

  private async indexExists(tableName: string, indexName: string) {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.statistics
       WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
      [tableName, indexName],
    );
    return Number(rows?.[0]?.count ?? 0) > 0;
  }

  private async ensureSourceServiceColumns() {
    for (const tableName of TABLES) {
      if (!(await this.tableExists(tableName))) continue;

      if (!(await this.columnExists(tableName, 'sourceService'))) {
        const hasServiceName = await this.columnExists(tableName, 'serviceName');
        await this.dataSource.query(
          `ALTER TABLE \`${tableName}\` ADD COLUMN \`sourceService\` varchar(80) NULL`,
        );
        if (hasServiceName) {
          await this.dataSource.query(
            `UPDATE \`${tableName}\` SET \`sourceService\` = COALESCE(\`serviceName\`, 'unknown-service') WHERE \`sourceService\` IS NULL`,
          );
        } else {
          await this.dataSource.query(
            `UPDATE \`${tableName}\` SET \`sourceService\` = 'unknown-service' WHERE \`sourceService\` IS NULL`,
          );
        }
        this.logger.log(`Added ${tableName}.sourceService for Phase 3 compatibility.`);
      }

      const indexName = `idx_${tableName}_source_service`;
      if (!(await this.indexExists(tableName, indexName))) {
        await this.dataSource.query(
          `CREATE INDEX \`${indexName}\` ON \`${tableName}\` (\`sourceService\`)`,
        );
      }
    }
  }
}
