import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('offering_campaigns')
@Index('idx_campaign_dates', ['start_date', 'end_date'])
@Index('idx_campaign_status', ['status'])
export class OfferingCampaign {
  @ApiProperty({
    description: 'Identifiant unique de la campagne',
    example: 'christmas-2025',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nom de la campagne',
    example: 'Collecte de Noël 2025',
    maxLength: 255,
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Description détaillée de la campagne',
    example: 'Collecte spéciale pour aider les familles démunies pendant les fêtes de fin d\'année',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Objectif de collecte en FCFA',
    example: 5000000,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  target_amount: number;

  @ApiProperty({
    description: 'Date de début de la campagne',
    example: '2025-12-01',
  })
  @Column({ type: 'date' })
  start_date: string;

  @ApiProperty({
    description: 'Date de fin de la campagne',
    example: '2025-12-31',
  })
  @Column({ type: 'date' })
  end_date: string;

  @ApiProperty({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
    default: CampaignStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @ApiProperty({
    description: 'Image de la campagne (URL)',
    example: 'https://example.com/campaign-image.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur créateur de la campagne',
    example: 'de037ba6-d617-4892-b57f-d74191bc4550',
  })
  @Column({ type: 'varchar', length: 36 })
  created_by_user_id: string;

  @ApiProperty({
    description: 'Date de création de la campagne',
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

  // Relations
  @OneToMany(() => Offering, (offering) => offering.campaign)
  offerings: Offering[];
}

// Import Offering ici pour eviter les dependances circulaires
import { Offering } from './offering.entity';