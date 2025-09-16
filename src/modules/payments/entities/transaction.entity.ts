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
import { PaymentGateway } from './payment-gateway.entity';

export enum TransactionType {
  MASS_REQUEST = 'mass_request',
  OFFERING = 'offering',
  CONTRIBUTION = 'contribution',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PaymentGateway)
  @JoinColumn({ name: 'payment_gateway_id' })
  payment_gateway: PaymentGateway;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  gateway_transaction_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'XOF' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transaction_type: TransactionType;

  @Column()
  related_object_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  net_amount: number;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
