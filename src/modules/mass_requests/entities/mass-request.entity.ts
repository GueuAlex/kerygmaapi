import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MassRequestType } from './mass-request-type.entity';

@Entity('mass_requests')
export class MassRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requester_user_id' })
  requester_user: User;

  @Column()
  requester_name: string;

  @Column({ length: 20, nullable: true })
  requester_phone: string;

  @Column({ length: 150, nullable: true })
  requester_email: string;

  @ManyToOne(() => MassRequestType)
  @JoinColumn({ name: 'mass_request_type_id' })
  mass_request_type: MassRequestType;

  @Column({ type: 'text', nullable: true })
  message_additionnel: string;

  @Column({
    type: 'enum',
    enum: [
      'pending_payment',
      'paid',
      'scheduled',
      'completed',
      'cancelled',
      'reported',
    ],
    default: 'pending_payment',
  })
  status:
    | 'pending_payment'
    | 'paid'
    | 'scheduled'
    | 'completed'
    | 'cancelled'
    | 'reported';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ nullable: true })
  payment_id: number;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @Column({ nullable: true })
  cancelled_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
