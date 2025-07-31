import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CelebrationType } from './celebration-type.entity';

@Entity('mass_calendar')
export class MassCalendar {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CelebrationType)
  @JoinColumn({ name: 'celebration_type_id' })
  celebration_type: CelebrationType;

  @Column({ type: 'date' })
  mass_date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: ['active', 'cancelled', 'disabled_requests'],
    default: 'active',
  })
  status: 'active' | 'cancelled' | 'disabled_requests';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  created_by_user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
