import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ContributionMethod {
  ONLINE = 'online',
  CASH_ON_SITE = 'cash_on_site',
}

export class CreateContributionDto {
  @ApiProperty({
    description: 'ID de la carte de contribution',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  card_id: number;

  @ApiPropertyOptional({
    description: "ID de l'utilisateur contributeur (optionnel pour especes)",
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  contributor_user_id?: string;

  @ApiProperty({
    description: 'Montant de la contribution en FCFA',
    example: 5000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Methode de contribution',
    enum: ContributionMethod,
    example: ContributionMethod.ONLINE,
  })
  @IsEnum(ContributionMethod)
  contribution_method: ContributionMethod;

  @ApiPropertyOptional({
    description: "ID de l'utilisateur qui a collecte (pour cash_on_site)",
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  collected_by_user_id?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Contribution lors de la messe dominicale',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ContributionResponseDto {
  @ApiProperty({
    description: 'ID de la contribution',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Carte associee',
    example: {
      id: 1,
      card_number: 'CARD-2025-000001',
      campaign_name: 'Construction Nouvelle Eglise 2025',
    },
  })
  card: {
    id: number;
    card_number: string;
    campaign_name: string;
  };

  @ApiProperty({
    description: 'Contributeur (si en ligne)',
    example: {
      id: 123,
      first_name: 'Jean',
      last_name: 'Dupont',
    },
    nullable: true,
  })
  contributor_user: {
    id: string;
    email: string;
  } | null;

  @ApiProperty({
    description: 'Montant contribue en FCFA',
    example: 5000,
  })
  amount: number;

  @ApiProperty({
    description: 'Methode de contribution',
    enum: ContributionMethod,
    example: ContributionMethod.ONLINE,
  })
  contribution_method: ContributionMethod;

  @ApiProperty({
    description: 'Utilisateur collecteur (pour especes)',
    example: {
      id: 456,
      first_name: 'Marie',
      last_name: 'Martin',
    },
    nullable: true,
  })
  collected_by_user: {
    id: string;
    email: string;
  } | null;

  @ApiProperty({
    description: 'Transaction de paiement (si en ligne)',
    example: {
      id: 789,
      status: 'success',
      gateway_transaction_id: 'TXN123456',
    },
    nullable: true,
  })
  payment: {
    id: number;
    status: string;
    gateway_transaction_id: string;
  } | null;

  @ApiProperty({
    description: 'Date de contribution',
  })
  contribution_date: Date;

  @ApiProperty({
    description: 'Notes',
    example: 'Contribution lors de la messe dominicale',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Date de creation',
  })
  created_at: Date;
}
