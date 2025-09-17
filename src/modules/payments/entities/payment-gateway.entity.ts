import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GatewayType } from '../enums/gateway-type.enum';

@Entity('payment_gateways')
export class PaymentGateway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['mobile_money', 'card', 'bank_transfer']
  })
  type: string;

  @Column({
    type: 'enum',
    enum: GatewayType,
    nullable: true
  })
  slug: GatewayType;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'integration_config', type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  transaction_fee_percentage: number;

  @Column({
    type: 'enum',
    enum: ['donor', 'parish', 'shared'],
    default: 'donor'
  })
  transaction_fee_payer: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
