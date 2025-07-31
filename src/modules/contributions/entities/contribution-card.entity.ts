import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContributionCampaign } from './contribution-campaign.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contribution_cards')
export class ContributionCard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContributionCampaign)
  @JoinColumn({ name: 'campaign_id' })
  campaign: ContributionCampaign;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 32, unique: true })
  card_code: string;

  @Column({ type: 'enum', enum: ['virtual', 'physical'], default: 'virtual' })
  type: 'virtual' | 'physical';

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
