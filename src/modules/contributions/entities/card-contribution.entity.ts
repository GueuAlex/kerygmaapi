import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContributionCard } from './contribution-card.entity';

@Entity('card_contributions')
export class CardContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContributionCard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: ContributionCard;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  contribution_date: string;

  @CreateDateColumn()
  created_at: Date;
}
