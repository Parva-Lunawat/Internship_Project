import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'obs_traces' })
@Index('idx_obs_traces_ts', ['timestamp'])
@Index('idx_obs_traces_endpoint', ['endpoint'])
@Index('idx_obs_traces_status_code', ['statusCode'])
@Index('idx_obs_traces_request_id', ['requestId'])
@Index('idx_obs_traces_trace_id', ['traceId'])
@Index('idx_obs_traces_source_service', ['sourceService'])
export class TraceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  requestId!: string | null;

  @Column({ type: 'varchar', length: 128 })
  traceId!: string;

  @Column({ type: 'varchar', length: 255 })
  endpoint!: string;

  @Column({ type: 'varchar', length: 12 })
  method!: string;

  @Column({ type: 'int', nullable: true })
  statusCode!: number | null;

  @Column({ type: 'double', nullable: true })
  latencyMs!: number | null;

  @Column({ type: 'datetime', precision: 6 })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 120, nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sourceService!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  serviceName!: string | null;

  @Column({ type: 'varchar', length: 20 })
  schemaVersion!: string;

  @Column({ type: 'json', nullable: true })
  payload!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt!: Date;
}
