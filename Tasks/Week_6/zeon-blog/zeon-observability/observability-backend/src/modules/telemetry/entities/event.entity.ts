import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'obs_events' })
@Index('idx_obs_events_ts', ['timestamp'])
@Index('idx_obs_events_event_type', ['eventType'])
@Index('idx_obs_events_endpoint', ['endpoint'])
@Index('idx_obs_events_status_code', ['statusCode'])
@Index('idx_obs_events_request_id', ['requestId'])
@Index('idx_obs_events_trace_id', ['traceId'])
@Index('idx_obs_events_user_id', ['userId'])
@Index('idx_obs_events_source_service', ['sourceService'])
export class EventEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  requestId!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  traceId!: string | null;

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

  @Column({ type: 'varchar', length: 120 })
  eventType!: string;

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
