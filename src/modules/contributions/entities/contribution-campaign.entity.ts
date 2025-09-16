import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ContributionCard } from './contribution-card.entity';

@Entity('contribution_campaigns')
@Index('idx_campaign_status', ['status'])
export class ContributionCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string;

  @Column({ type: 'boolean', default: false })
  is_fixed_amount: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixed_amount: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'completed'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'completed';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user: User;

  @OneToMany(() => ContributionCard, (card) => card.campaign)
  cards: ContributionCard[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
