import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CelebrationTypeBasicDto } from './basic-types.dto';

export enum MassStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DISABLED_REQUESTS = 'disabled_requests',
}

export class CreateMassCalendarDto {
  @ApiProperty({
    description: 'ID du type de célébration',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  celebration_type_id: number;

  @ApiProperty({
    description: 'Date de la messe (format YYYY-MM-DD)',
    example: '2025-01-12',
  })
  @IsDateString()
  mass_date: string;

  @ApiProperty({
    description: 'Heure de début (format HH:MM)',
    example: '08:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format d\'heure invalide. Utilisez HH:MM',
  })
  start_time: string;

  @ApiProperty({
    description: 'Heure de fin (format HH:MM)',
    example: '09:30',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format d\'heure invalide. Utilisez HH:MM',
  })
  end_time: string;

  @ApiPropertyOptional({
    description: 'Lieu de la célébration',
    example: 'Église Saint-Pierre, Yamoussoukro',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Statut de la messe',
    enum: MassStatus,
    example: MassStatus.ACTIVE,
    default: MassStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MassStatus)
  status?: MassStatus;

  @ApiPropertyOptional({
    description: 'Notes additionnelles pour la messe',
    example: 'Messe avec baptême de 3 enfants',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMassCalendarDto {
  @ApiPropertyOptional({
    description: 'ID du type de célébration',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  celebration_type_id?: number;

  @ApiPropertyOptional({
    description: 'Date de la messe (format YYYY-MM-DD)',
    example: '2025-01-12',
  })
  @IsOptional()
  @IsDateString()
  mass_date?: string;

  @ApiPropertyOptional({
    description: 'Heure de début (format HH:MM)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format d\'heure invalide. Utilisez HH:MM',
  })
  start_time?: string;

  @ApiPropertyOptional({
    description: 'Heure de fin (format HH:MM)',
    example: '09:30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format d\'heure invalide. Utilisez HH:MM',
  })
  end_time?: string;

  @ApiPropertyOptional({
    description: 'Lieu de la célébration',
    example: 'Église Saint-Pierre, Yamoussoukro',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Statut de la messe',
    enum: MassStatus,
    example: MassStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MassStatus)
  status?: MassStatus;

  @ApiPropertyOptional({
    description: 'Notes additionnelles pour la messe',
    example: 'Messe avec baptême de 3 enfants',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryMassCalendarDto {
  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Date de début pour filtrer (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Date de fin pour filtrer (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par type de célébration',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  celebration_type_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: MassStatus,
    example: MassStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MassStatus)
  status?: MassStatus;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'mass_date',
    default: 'mass_date',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'mass_date';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
    default: 'ASC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class MassCalendarResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la messe',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Type de célébration',
    type: CelebrationTypeBasicDto,
  })
  celebration_type: CelebrationTypeBasicDto;

  @ApiProperty({
    description: 'Date de la messe',
    example: '2025-01-12',
  })
  mass_date: string;

  @ApiProperty({
    description: 'Heure de début',
    example: '08:00:00',
  })
  start_time: string;

  @ApiProperty({
    description: 'Heure de fin',
    example: '09:30:00',
  })
  end_time: string;

  @ApiProperty({
    description: 'Lieu de la célébration',
    example: 'Église Saint-Pierre, Yamoussoukro',
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Statut de la messe',
    enum: MassStatus,
    example: MassStatus.ACTIVE,
  })
  status: MassStatus;

  @ApiProperty({
    description: 'Notes additionnelles',
    example: 'Messe avec baptême de 3 enfants',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'ID de l\'utilisateur créateur',
    example: 'de037ba6-d617-4892-b57f-d74191bc4550',
    nullable: true,
  })
  created_by_user_id: string | null;

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

export class PaginatedMassCalendarResponseDto {
  @ApiProperty({
    description: 'Liste des messes',
    type: [MassCalendarResponseDto],
  })
  data: MassCalendarResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      total: 50,
      page: 1,
      limit: 10,
      totalPages: 5,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}