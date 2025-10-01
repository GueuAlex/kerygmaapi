import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContributionCard } from './contribution-card.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../payments/entities/transaction.entity';

@Entity('contributions')
export class CardContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContributionCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: ContributionCard;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'contributor_user_id' })
  contributor_user?: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Transaction;

  @Column({
    type: 'enum',
    enum: ['online', 'cash_on_site'],
  })
  contribution_method: 'online' | 'cash_on_site';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'collected_by_user_id' })
  collected_by_user?: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  contribution_date: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;
}
