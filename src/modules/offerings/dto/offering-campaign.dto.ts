import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsObject,
  ValidateNested,
  IsUrl,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CampaignStatus } from '../entities/offering-campaign.entity';

export class CampaignSettingsDto {
  @ApiPropertyOptional({
    description: 'Campagne publique visible par tous',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({
    description: 'Autoriser les dons anonymes',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allow_anonymous?: boolean;

  @ApiPropertyOptional({
    description: 'Envoyer des reçus automatiquement',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  send_receipts?: boolean;

  @ApiPropertyOptional({
    description: 'Seuil de notification en FCFA',
    example: 100000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  notification_threshold?: number;

  @ApiPropertyOptional({
    description: 'Champs personnalisés pour les dons',
    example: ['Nom de famille', 'Téléphone', 'Adresse'],
    type: [String],
  })
  @IsOptional()
  custom_fields?: string[];
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Nom de la campagne',
    example: 'Collecte de Noël 2025',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description détaillée de la campagne',
    example: 'Collecte spéciale pour aider les familles démunies pendant les fêtes de fin d\'année',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Objectif de collecte en FCFA',
    example: 5000000,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  target_amount?: number;

  @ApiProperty({
    description: 'Date de début de la campagne (YYYY-MM-DD)',
    example: '2025-12-01',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'Date de fin de la campagne (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({
    description: 'Image de la campagne (URL)',
    example: 'https://example.com/campaign-image.jpg',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Configuration de la campagne',
    type: CampaignSettingsDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CampaignSettingsDto)
  settings?: CampaignSettingsDto;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @ApiPropertyOptional({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class CampaignResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la campagne',
    example: 'christmas-2025',
  })
  id: string;

  @ApiProperty({
    description: 'Nom de la campagne',
    example: 'Collecte de Noël 2025',
  })
  name: string;

  @ApiProperty({
    description: 'Description détaillée de la campagne',
    example: 'Collecte spéciale pour aider les familles démunies pendant les fêtes de fin d\'année',
  })
  description: string;

  @ApiProperty({
    description: 'Objectif de collecte en FCFA',
    example: 5000000,
    nullable: true,
  })
  target_amount: number | null;

  @ApiProperty({
    description: 'Date de début de la campagne',
    example: '2025-12-01',
  })
  start_date: string;

  @ApiProperty({
    description: 'Date de fin de la campagne',
    example: '2025-12-31',
  })
  end_date: string;

  @ApiProperty({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;

  @ApiProperty({
    description: 'Image de la campagne (URL)',
    example: 'https://example.com/campaign-image.jpg',
    nullable: true,
  })
  image_url: string | null;

  @ApiProperty({
    description: 'Configuration de la campagne',
    example: {
      is_public: true,
      allow_anonymous: true,
      send_receipts: true,
      notification_threshold: 100000,
    },
    nullable: true,
  })
  settings: CampaignSettingsDto | null;

  @ApiProperty({
    description: 'Statistiques de la campagne',
    example: {
      total_raised: 2500000,
      total_donors: 45,
      average_donation: 55555.56,
      progress_percentage: 50,
      days_remaining: 15,
    },
  })
  stats: {
    total_raised: number;
    total_donors: number;
    average_donation: number;
    progress_percentage: number;
    days_remaining: number;
  };

  @ApiProperty({
    description: 'ID de l\'utilisateur créateur',
    example: 'de037ba6-d617-4892-b57f-d74191bc4550',
  })
  created_by_user_id: string;

  @ApiProperty({
    description: 'Date de création de la campagne',
    example: '2025-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-01-20T14:45:00Z',
  })
  updated_at: Date;
}

export class QueryCampaignsDto {
  @ApiPropertyOptional({
    description: 'Recherche par nom de campagne',
    example: 'noël',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Date de début pour le filtrage',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Date de fin pour le filtrage',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Campagnes publiques uniquement',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'created_at',
    enum: ['name', 'start_date', 'end_date', 'created_at'],
    default: 'created_at',
  })
  @IsOptional()
  sortBy?: 'name' | 'start_date' | 'end_date' | 'created_at';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class CampaignsListResponseDto {
  @ApiProperty({
    description: 'Liste des campagnes',
    type: [CampaignResponseDto],
  })
  data: CampaignResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      total: 12,
      page: 1,
      limit: 10,
      totalPages: 2,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}