import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OfferingType } from './offering-type.entity';
import { User } from '../../users/entities/user.entity';

@Entity('offerings')
export class Offering {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OfferingType)
  @JoinColumn({ name: 'offering_type_id' })
  offering_type: OfferingType;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  created_at: Date;
}
