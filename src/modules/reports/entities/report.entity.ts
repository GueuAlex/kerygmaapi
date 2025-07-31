import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ReportConfig } from './report-config.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ReportConfig)
  @JoinColumn({ name: 'report_config_id' })
  report_config: ReportConfig;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['draft', 'final', 'archived'],
    default: 'draft',
  })
  status: 'draft' | 'final' | 'archived';

  @CreateDateColumn()
  created_at: Date;
}
