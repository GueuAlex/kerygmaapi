import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MassRequest } from './mass-request.entity';
import { MassCalendar } from '../../masses/entities/mass-calendar.entity';

@Entity('mass_request_schedules')
export class MassRequestSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MassRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mass_request_id' })
  mass_request: MassRequest;

  @ManyToOne(() => MassCalendar)
  @JoinColumn({ name: 'mass_calendar_id' })
  mass_calendar: MassCalendar;

  @Column({ type: 'date' })
  scheduled_date: string;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'celebrated', 'transferred'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'celebrated' | 'transferred';

  @Column({ nullable: true })
  transfer_to_mass_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
