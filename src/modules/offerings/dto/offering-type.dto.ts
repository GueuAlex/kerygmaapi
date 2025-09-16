import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateOfferingTypeDto {
  @ApiProperty({
    description: 'Nom du type d\'offrande',
    example: 'Dîme',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du type d\'offrande',
    example: 'Contribution mensuelle représentant 10% des revenus',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Statut actif/inactif du type d\'offrande',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateOfferingTypeDto extends PartialType(CreateOfferingTypeDto) {}

export class OfferingTypeResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du type d\'offrande',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du type d\'offrande',
    example: 'Dîme',
  })
  name: string;

  @ApiProperty({
    description: 'Description détaillée du type d\'offrande',
    example: 'Contribution mensuelle représentant 10% des revenus',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Statut actif/inactif du type d\'offrande',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Date de création du type d\'offrande',
    example: '2025-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-01-20T14:45:00Z',
  })
  updated_at: Date;
}

export class QueryOfferingTypesDto {
  @ApiPropertyOptional({
    description: 'Recherche par nom du type',
    example: 'dîme',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif/inactif',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'name',
    enum: ['name', 'created_at', 'updated_at'],
    default: 'name',
  })
  @IsOptional()
  sortBy?: 'name' | 'created_at' | 'updated_at';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class OfferingTypesListResponseDto {
  @ApiProperty({
    description: 'Liste des types d\'offrandes',
    type: [OfferingTypeResponseDto],
  })
  data: OfferingTypeResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}