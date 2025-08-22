import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCelebrationTypeDto {
  @ApiProperty({
    description: 'Nom du type de célébration',
    example: 'Messe dominicale',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du type de célébration',
    example: 'Messe célébrée chaque dimanche avec homélie et chants',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCelebrationTypeDto {
  @ApiPropertyOptional({
    description: 'Nom du type de célébration',
    example: 'Messe dominicale rénovée',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du type de célébration',
    example: 'Messe célébrée chaque dimanche avec homélie, chants et prières spéciales',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CelebrationTypeResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du type de célébration',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du type de célébration',
    example: 'Messe dominicale',
  })
  name: string;

  @ApiProperty({
    description: 'Description du type de célébration',
    example: 'Messe célébrée chaque dimanche avec homélie et chants',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-01-08T10:00:00.000Z',
  })
  created_at: Date;
}