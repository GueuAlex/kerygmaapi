import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMassRequestTypeDto {
  @ApiProperty({
    description: 'Nom du type de demande de messe',
    example: 'Messe pour un défunt',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du type de demande',
    example: 'Messe célébrée en mémoire d\'une personne décédée',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Montant de base pour ce type de demande (en FCFA)',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  base_amount: number;

  @ApiPropertyOptional({
    description: 'Détails du template pour ce type de demande',
    example: {
      required_fields: ['nom_defunt', 'date_deces'],
      optional_fields: ['message_famille'],
      duration_days: 1,
    },
  })
  @IsOptional()
  @IsObject()
  template_details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Indique si ce type est actif',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}

export class UpdateMassRequestTypeDto {
  @ApiPropertyOptional({
    description: 'Nom du type de demande de messe',
    example: 'Messe pour un défunt - Modifié',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du type de demande',
    example: 'Messe célébrée en mémoire d\'une personne décédée avec prières spéciales',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Montant de base pour ce type de demande (en FCFA)',
    example: 5500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  base_amount?: number;

  @ApiPropertyOptional({
    description: 'Détails du template pour ce type de demande',
    example: {
      required_fields: ['nom_defunt', 'date_deces', 'lieu_deces'],
      optional_fields: ['message_famille', 'photo'],
      duration_days: 1,
    },
  })
  @IsOptional()
  @IsObject()
  template_details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Indique si ce type est actif',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class MassRequestTypeResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du type de demande',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du type de demande de messe',
    example: 'Messe pour un défunt',
  })
  name: string;

  @ApiProperty({
    description: 'Description du type de demande',
    example: 'Messe célébrée en mémoire d\'une personne décédée',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Montant de base (en FCFA)',
    example: 5000,
  })
  base_amount: number;

  @ApiProperty({
    description: 'Détails du template',
    example: {
      required_fields: ['nom_defunt', 'date_deces'],
      optional_fields: ['message_famille'],
      duration_days: 1,
    },
    nullable: true,
  })
  template_details: Record<string, any> | null;

  @ApiProperty({
    description: 'Statut actif/inactif',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-01-08T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2025-01-08T10:00:00.000Z',
  })
  updated_at: Date;
}