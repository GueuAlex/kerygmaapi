import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsObject,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OfferingStatus, PaymentMethod } from '../entities/offering.entity';
import { OfferingTypeResponseDto } from './offering-type.dto';

export class AnonymousDonorInfoDto {
  @ApiPropertyOptional({
    description: 'Nom complet du donateur anonyme',
    example: 'Jean Dupont',
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone du donateur',
    example: '+225070123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email du donateur',
    example: 'jean.dupont@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Adresse du donateur',
    example: 'Abidjan, Côte d\'Ivoire',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateOfferingDto {
  @ApiProperty({
    description: 'ID du type d\'offrande',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  offering_type_id: number;

  @ApiProperty({
    description: 'Montant de l\'offrande en FCFA',
    example: 25000.50,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Message ou intention de l\'offrande',
    example: 'Pour la construction de la nouvelle église',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Méthode de paiement utilisée',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY,
    default: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Informations du donateur anonyme (si pas d\'utilisateur connecté)',
    type: AnonymousDonorInfoDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AnonymousDonorInfoDto)
  anonymous_donor_info?: AnonymousDonorInfoDto;

  @ApiPropertyOptional({
    description: 'ID de campagne d\'offrande (optionnel)',
    example: 'christmas-2025',
  })
  @IsOptional()
  @IsString()
  campaign_id?: string;
}

export class UpdateOfferingDto {
  @ApiPropertyOptional({
    description: 'Statut de l\'offrande',
    enum: OfferingStatus,
    example: OfferingStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(OfferingStatus)
  status?: OfferingStatus;

  @ApiPropertyOptional({
    description: 'Message ou intention de l\'offrande',
    example: 'Pour la construction de la nouvelle église',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class OfferingResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de l\'offrande',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Type d\'offrande associé',
    type: OfferingTypeResponseDto,
  })
  offering_type: OfferingTypeResponseDto;

  @ApiProperty({
    description: 'Montant de l\'offrande en FCFA',
    example: 25000.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Message ou intention de l\'offrande',
    example: 'Pour la construction de la nouvelle église',
    nullable: true,
  })
  message: string | null;

  @ApiProperty({
    description: 'Statut de l\'offrande',
    enum: OfferingStatus,
    example: OfferingStatus.COMPLETED,
  })
  status: OfferingStatus;

  @ApiProperty({
    description: 'Méthode de paiement utilisée',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY,
  })
  payment_method: PaymentMethod;

  @ApiProperty({
    description: 'Informations du donateur (nom masqué pour anonymat)',
    example: { full_name: 'J*** D***', is_anonymous: true },
    nullable: true,
  })
  donor_info: {
    full_name?: string;
    is_anonymous?: boolean;
  } | null;

  @ApiProperty({
    description: 'ID de campagne d\'offrande',
    example: 'christmas-2025',
    nullable: true,
  })
  campaign_id: string | null;

  @ApiProperty({
    description: 'Date de création de l\'offrande',
    example: '2025-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-01-20T14:45:00Z',
  })
  updated_at: Date;
}

export class QueryOfferingsDto {
  @ApiPropertyOptional({
    description: 'Filtrer par type d\'offrande',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @IsNumber()
  offering_type_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: OfferingStatus,
    example: OfferingStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(OfferingStatus)
  status?: OfferingStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par méthode de paiement',
    enum: PaymentMethod,
    example: PaymentMethod.MOBILE_MONEY,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Date de début (format YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (format YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Montant minimum',
    example: 1000,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  min_amount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum',
    example: 100000,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  max_amount?: number;

  @ApiPropertyOptional({
    description: 'ID de campagne',
    example: 'christmas-2025',
  })
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'created_at',
    enum: ['amount', 'created_at', 'updated_at'],
    default: 'created_at',
  })
  @IsOptional()
  sortBy?: 'amount' | 'created_at' | 'updated_at';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class OfferingsListResponseDto {
  @ApiProperty({
    description: 'Liste des offrandes',
    type: [OfferingResponseDto],
  })
  data: OfferingResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      total: 150,
      page: 1,
      limit: 10,
      totalPages: 15,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}