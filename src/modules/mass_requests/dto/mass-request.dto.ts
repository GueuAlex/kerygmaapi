import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEmail,
  IsEnum,
  MaxLength,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequesterUserBasicDto, MassRequestTypeBasicDto } from './basic-types.dto';

export enum MassRequestStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REPORTED = 'reported',
}

export class CreateMassRequestDto {
  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur demandeur (optionnel si utilisateur connecté)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  requester_user_id?: string;

  @ApiProperty({
    description: 'Nom complet du demandeur',
    example: 'Jean Baptiste Kouassi',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  requester_name: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone du demandeur',
    example: '+225 07 12 34 56 78',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  requester_phone?: string;

  @ApiPropertyOptional({
    description: 'Email du demandeur',
    example: 'jean.kouassi@example.com',
    maxLength: 150,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  requester_email?: string;

  @ApiProperty({
    description: 'ID du type de demande de messe',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  mass_request_type_id: number;

  @ApiPropertyOptional({
    description: `
**Mode 1 : Sélection d'une messe existante**

ID de la messe choisie dans le calendrier liturgique.

- Si fourni : \`scheduled_date\` sera auto-rempli avec la date de la messe
- Si fourni avec \`scheduled_date\` : vérification de cohérence
- Obtenir la liste : \`GET /mass-requests/available-masses\`

⚠️ **Validation** : Au moins \`mass_calendar_id\` OU \`scheduled_date\` requis
    `,
    example: 5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'mass_calendar_id doit être un nombre' })
  @IsPositive({ message: 'mass_calendar_id doit être positif' })
  @Type(() => Number)
  mass_calendar_id?: number;

  @ApiPropertyOptional({
    description: `
**Mode 2 : Date libre personnalisée**

Date souhaitée pour la célébration au format YYYY-MM-DD.

- Si seul : \`mass_calendar\` sera \`null\` dans la réponse
- Si fourni avec \`mass_calendar_id\` : doit correspondre à la date de la messe
- Interdiction des dates passées

⚠️ **Validation** : Au moins \`mass_calendar_id\` OU \`scheduled_date\` requis
    `,
    example: '2025-12-25',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (YYYY-MM-DD)' })
  scheduled_date?: string;

  @ApiPropertyOptional({
    description: 'Message additionnel ou intentions spéciales',
    example: 'Messe en mémoire de notre père décédé le 15 décembre 2024',
  })
  @IsOptional()
  @IsString()
  message_additionnel?: string;

  @ApiPropertyOptional({
    description: 'Montant total de la demande (calculé automatiquement si non fourni)',
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total_amount?: number;

  @ApiPropertyOptional({
    description: 'Statut initial de la demande',
    enum: MassRequestStatus,
    example: MassRequestStatus.PENDING_PAYMENT,
  })
  @IsOptional()
  @IsEnum(MassRequestStatus)
  status?: MassRequestStatus;
}

export class UpdateMassRequestDto {
  @ApiPropertyOptional({
    description: 'Nom complet du demandeur',
    example: 'Jean Baptiste Kouassi Modifié',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  requester_name?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone du demandeur',
    example: '+225 07 87 65 43 21',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  requester_phone?: string;

  @ApiPropertyOptional({
    description: 'Email du demandeur',
    example: 'jean.nouveau@example.com',
    maxLength: 150,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  requester_email?: string;

  @ApiPropertyOptional({
    description: 'ID du type de demande de messe',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  mass_request_type_id?: number;

  @ApiPropertyOptional({
    description: 'Message additionnel ou intentions spéciales',
    example: 'Messe en mémoire de notre père avec prières spéciales',
  })
  @IsOptional()
  @IsString()
  message_additionnel?: string;

  @ApiPropertyOptional({
    description: 'Statut de la demande',
    enum: MassRequestStatus,
    example: MassRequestStatus.PAID,
  })
  @IsOptional()
  @IsEnum(MassRequestStatus)
  status?: MassRequestStatus;

  @ApiPropertyOptional({
    description: 'Montant total (modifiable par les administrateurs)',
    example: 5500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  total_amount?: number;

  @ApiPropertyOptional({
    description: 'ID du paiement associé',
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  payment_id?: number;

  @ApiPropertyOptional({
    description: 'Raison de l\'annulation (si statut = cancelled)',
    example: 'Annulation à la demande de la famille',
  })
  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}

export class QueryMassRequestsDto {
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
    description: 'Rechercher par nom du demandeur',
    example: 'Kouassi',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: MassRequestStatus,
    example: MassRequestStatus.PAID,
  })
  @IsOptional()
  @IsEnum(MassRequestStatus)
  status?: MassRequestStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par type de demande',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  mass_request_type_id?: number;

  @ApiPropertyOptional({
    description: 'Date de début pour filtrer les demandes',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Date de fin pour filtrer les demandes',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'created_at',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class MassRequestResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la demande',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Utilisateur demandeur (si connecté)',
    type: () => RequesterUserBasicDto,
    nullable: true,
  })
  requester_user: RequesterUserBasicDto | null;

  @ApiProperty({
    description: 'Nom complet du demandeur',
    example: 'Jean Baptiste Kouassi',
  })
  requester_name: string;

  @ApiProperty({
    description: 'Téléphone du demandeur',
    example: '+225 07 12 34 56 78',
    nullable: true,
  })
  requester_phone: string | null;

  @ApiProperty({
    description: 'Email du demandeur',
    example: 'jean.kouassi@example.com',
    nullable: true,
  })
  requester_email: string | null;

  @ApiProperty({
    description: 'Type de demande de messe',
    type: () => MassRequestTypeBasicDto,
  })
  mass_request_type: MassRequestTypeBasicDto;

  @ApiProperty({
    description: 'Messe programmée dans le calendrier (null si date libre)',
    type: () => Object,
    nullable: true,
  })
  mass_calendar: {
    id: number;
    mass_date: string;
    start_time: string;
    end_time: string;
    location: string;
    celebration_type: {
      id: number;
      name: string;
      description: string;
    };
  } | null;

  @ApiProperty({
    description: 'Date de célébration programmée',
    example: '2025-12-25',
  })
  scheduled_date: string;

  @ApiProperty({
    description: 'Message additionnel',
    example: 'Messe en mémoire de notre père',
    nullable: true,
  })
  message_additionnel: string | null;

  @ApiProperty({
    description: 'Statut de la demande',
    enum: MassRequestStatus,
    example: MassRequestStatus.PAID,
  })
  status: MassRequestStatus;

  @ApiProperty({
    description: 'Montant total (en FCFA)',
    example: 5000,
  })
  total_amount: number;

  @ApiProperty({
    description: 'ID du paiement associé',
    example: 123,
    nullable: true,
  })
  payment_id: number | null;

  @ApiProperty({
    description: 'Raison de l\'annulation',
    example: 'Annulation à la demande de la famille',
    nullable: true,
  })
  cancellation_reason: string | null;

  @ApiProperty({
    description: 'Date d\'annulation',
    example: '2025-01-08T15:30:00.000Z',
    nullable: true,
  })
  cancelled_at: Date | null;

  @ApiProperty({
    description: 'Date de création de la demande',
    example: '2025-01-08T10:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2025-01-08T10:00:00.000Z',
  })
  updated_at: Date;
}

export class PaginatedMassRequestsResponseDto {
  @ApiProperty({
    description: 'Liste des demandes de messes',
    type: [MassRequestResponseDto],
  })
  data: MassRequestResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      total: 75,
      page: 1,
      limit: 10,
      totalPages: 8,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}