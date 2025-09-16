import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum CampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Nom unique de la campagne de cotisation',
    example: 'Construction Nouvelle Église 2025',
    maxLength: 255,
    minLength: 3,
    pattern: '^[a-zA-ZÀ-ÿ0-9\\s\\-_]+$',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: `
    Description détaillée expliquant l'objectif et les modalités de la campagne.
    
    **Utilisation :**
    - Décrivez clairement l'objectif de la campagne
    - Mentionnez l'utilisation prévue des fonds
    - Ajoutez des détails motivants pour les contributeurs
    `,
    example: 'Campagne pour financer la construction de la nouvelle église paroissiale. Objectif : collecter 50 millions FCFA pour les matériaux et la main d\'œuvre. Démarrage prévu en juin 2025.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: `
    Date officielle de lancement de la campagne (format YYYY-MM-DD).
    
    **Important :**
    - Ne peut pas être antérieure à la date actuelle
    - Doit être antérieure à la date de fin si spécifiée
    - Utilisée pour l'activation automatique de la campagne
    `,
    example: '2025-01-01',
    format: 'date',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    description: `
    Date de clôture de la campagne (format YYYY-MM-DD).
    
    **Comportement :**
    - Si non spécifiée, la campagne reste ouverte indéfiniment
    - La campagne passe automatiquement en statut 'completed' à cette date
    - Les cartes restent actives mais plus de nouvelles cartes ne peuvent être créées
    `,
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: `
    Définit si la campagne utilise des montants fixes ou variables.
    
    **Montants fixes :**
    - Tous les contributeurs paient le même montant
    - Idéal pour des campagnes équitables (ex: cotisation annuelle)
    
    **Montants variables :**
    - Chaque contributeur peut donner le montant de son choix
    - Plus flexible pour des campagnes de construction
    `,
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_fixed_amount?: boolean;

  @ApiPropertyOptional({
    description: `
    Montant obligatoire en FCFA si la campagne utilise des montants fixes.
    
    **Règles :**
    - Obligatoire si is_fixed_amount = true
    - Doit être > 0
    - Sera le montant par défaut sur toutes les cartes
    `,
    example: 50000,
    minimum: 1,
    maximum: 10000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  fixed_amount?: number;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({
    description: 'Nom de la campagne',
    example: 'Construction Nouvelle Eglise 2025 - Modifie',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description de la campagne',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Date de fin de la campagne',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Montant fixe',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  fixed_amount?: number;
}

export class CampaignResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la campagne',
    example: 1,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Nom unique de la campagne de cotisation',
    example: 'Construction Nouvelle Église 2025',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Description détaillée de la campagne avec objectifs et modalités',
    example: 'Campagne pour financer la construction de la nouvelle église paroissiale. Objectif : collecter 50 millions FCFA pour les matériaux et la main d\'œuvre.',
    nullable: true,
    maxLength: 1000,
  })
  description: string | null;

  @ApiProperty({
    description: 'Date de debut',
    example: '2025-01-01',
  })
  start_date: string;

  @ApiProperty({
    description: 'Date de fin',
    example: '2025-12-31',
    nullable: true,
  })
  end_date: string | null;

  @ApiProperty({
    description: 'Si les montants sont fixes',
    example: false,
  })
  is_fixed_amount: boolean;

  @ApiProperty({
    description: 'Montant fixe en FCFA',
    example: 50000,
    nullable: true,
  })
  fixed_amount: number | null;

  @ApiProperty({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;

  @ApiProperty({
    description: `
    Nombre total de cartes créées pour cette campagne.
    
    **Inclut :**
    - Cartes virtuelles et physiques
    - Cartes actives, inactives et complétées
    - Cartes liées à des utilisateurs ou anonymes
    `,
    example: 150,
    minimum: 0,
  })
  total_cards: number;

  @ApiProperty({
    description: `
    Montant total collecté en FCFA pour cette campagne.
    
    **Calcul :**
    - Somme de toutes les contributions validées
    - Inclut les paiements en ligne et en espèces
    - Mis à jour en temps réel
    `,
    example: 2500000,
    minimum: 0,
  })
  total_collected: number;

  @ApiProperty({
    description: 'Date de creation',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de derniere mise a jour',
  })
  updated_at: Date;
}

export class QueryCampaignsDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: CampaignStatus,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Date de debut minimum (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @ApiPropertyOptional({
    description: 'Date de debut maximum (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  start_date_to?: string;

  @ApiPropertyOptional({
    description: 'Page numero',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'elements par page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number;
}