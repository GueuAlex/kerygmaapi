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
import { ContributionCampaign } from './contribution-campaign.entity';
import { User } from '../../users/entities/user.entity';
import { CardContribution } from './card-contribution.entity';

@Entity('contribution_cards')
@Index('idx_card_number', ['card_number'])
@Index('idx_card_user', ['user'])
@Index('idx_card_campaign', ['campaign'])
@Index('idx_card_phone', ['phone_number'])
export class ContributionCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ContributionCampaign, (campaign) => campaign.cards)
  @JoinColumn({ name: 'campaign_id' })
  campaign: ContributionCampaign;

  @Column({ length: 50, unique: true })
  card_number: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 20, nullable: true })
  phone_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  initial_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_balance: number;

  @Column({ length: 255, nullable: true })
  qr_code_url: string;

  @Column({ type: 'boolean', default: false })
  is_physical: boolean;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'completed', 'suspended'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'completed' | 'suspended';

  @OneToMany(() => CardContribution, (contribution) => contribution.card)
  contributions: CardContribution[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
