import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MassRequestType } from './mass-request-type.entity';
import { MassCalendar } from '../../masses/entities/mass-calendar.entity';

@Entity('mass_request_packages')
export class MassRequestPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => MassRequestType)
  @JoinColumn({ name: 'mass_request_type_id' })
  mass_request_type: MassRequestType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', nullable: true })
  valid_from: string;

  @Column({ type: 'date', nullable: true })
  valid_until: string;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => MassCalendar, { nullable: true })
  @JoinColumn({ name: 'applies_to_mass_id' })
  applies_to_mass: MassCalendar;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
