import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OfferingType } from './offering-type.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../payments/entities/transaction.entity';

export enum OfferingStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
}

@Entity('offerings')
@Index('idx_offering_date', ['created_at'])
@Index('idx_offering_amount', ['amount'])
@Index('idx_offering_status', ['status'])
export class Offering {
  @ApiProperty({
    description: 'Identifiant unique de l\'offrande',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Type d\'offrande associé',
    type: () => OfferingType,
  })
  @ManyToOne(() => OfferingType)
  @JoinColumn({ name: 'offering_type_id' })
  offering_type: OfferingType;

  @ApiProperty({
    description: 'Utilisateur donateur (optionnel pour dons anonymes)',
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Montant de l\'offrande en FCFA',
    example: 25000.50,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Message ou intention de l\'offrande',
    example: 'Pour la construction de la nouvelle église',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  message: string;

  @ApiProperty({
    description: 'Statut de l\'offrande',
    enum: OfferingStatus,
    example: OfferingStatus.COMPLETED,
    default: OfferingStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: OfferingStatus,
    default: OfferingStatus.PENDING,
  })
  status: OfferingStatus;

  @ApiProperty({
    description: 'Méthode de paiement utilisée',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY,
    default: PaymentMethod.CASH,
  })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  payment_method: PaymentMethod;

  @ApiProperty({
    description: 'Informations du donateur anonyme',
    example: {
      full_name: 'Jean Dupont',
      phone: '+225070123456',
      email: 'jean.dupont@example.com',
    },
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  anonymous_donor_info: {
    full_name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };

  @ApiProperty({
    description: 'ID de campagne d\'offrande (optionnel)',
    example: 'christmas-2025',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  campaign_id: string;

  @ApiProperty({
    description: 'Transaction de paiement associée',
    type: () => Transaction,
    required: false,
  })
  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Transaction;

  @ApiProperty({
    description: 'Date de création de l\'offrande',
    example: '2025-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-01-20T14:45:00Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
