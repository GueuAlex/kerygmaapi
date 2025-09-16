import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsEnum,
  IsPhoneNumber,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum CardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
}

export class CreateCardDto {
  @ApiProperty({
    description: `
    Identifiant de la campagne à laquelle sera rattachée la carte.
    
    **Validation :**
    - La campagne doit exister et être active
    - L'utilisateur doit avoir les permissions pour cette campagne
    `,
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  campaign_id: number;

  @ApiPropertyOptional({
    description: `
    UUID de l'utilisateur propriétaire de la carte (optionnel).
    
    **Cas d'usage :**
    - Carte personnelle : spécifiez l'user_id
    - Carte anonyme/familiale : laissez vide et utilisez phone_number
    - Une carte ne peut avoir qu'un user_id OU un phone_number
    `,
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: `
    Numéro de téléphone pour les cartes non rattachées à un utilisateur.
    
    **Format attendu :** Format international (+225XXXXXXXX)
    **Utilisation :** Pour les cartes familiales ou temporaires
    **Validation :** Numéro unique par campagne si pas d'user_id
    `,
    example: '+225070123456',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({
    description: `
    Montant objectif initial en FCFA pour cette carte.
    
    **Comportement :**
    - Si campagne à montant fixe : utilise le montant de la campagne
    - Si campagne variable : montant personnalisable
    - Valeur 0 = pas d'objectif défini
    `,
    example: 50000,
    minimum: 0,
    maximum: 50000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  initial_amount?: number;

  @ApiPropertyOptional({
    description: `
    Définit si la carte est physique ou virtuelle.
    
    **Carte virtuelle (false) :**
    - QR code affiché à l'écran uniquement
    - Contributions principalement en ligne
    
    **Carte physique (true) :**
    - QR code à imprimer
    - Contributions en espèces ou en ligne
    `,
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_physical?: boolean;
}

export class UpdateCardDto {
  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur proprietaire',
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Numero de telephone',
    example: '+225070123456',
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'Montant cible initial',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  initial_amount?: number;

  @ApiPropertyOptional({
    description: 'Statut de la carte',
    enum: CardStatus,
  })
  @IsOptional()
  @IsEnum(CardStatus)
  status?: CardStatus;
}

export class CardResponseDto {
  @ApiProperty({
    description: 'ID de la carte',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: `
    Numéro unique auto-généré de la carte.
    
    **Format :** CARD-YYYY-XXXXXX
    - YYYY : Année de création
    - XXXXXX : Numéro séquentiel sur 6 chiffres
    `,
    example: 'CARD-2025-000001',
    pattern: '^CARD-\\d{4}-\\d{6}$',
    readOnly: true,
  })
  card_number: string;

  @ApiProperty({
    description: 'Informations de la campagne associée',
    example: {
      id: 1,
      name: 'Construction Nouvelle Église 2025',
      status: 'active',
    },
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID de la campagne' },
      name: { type: 'string', description: 'Nom de la campagne' },
      status: { type: 'string', description: 'Statut de la campagne' },
    },
  })
  campaign: {
    id: number;
    name: string;
    status: string;
  };

  @ApiProperty({
    description: 'Utilisateur proprietaire (si lie)',
    example: {
      id: 123,
      first_name: 'Jean',
      last_name: 'Dupont',
    },
    nullable: true,
  })
  user: {
    id: string;
    email: string;
  } | null;

  @ApiProperty({
    description: 'Numero de telephone (si pas d\'utilisateur)',
    example: '+225070123456',
    nullable: true,
  })
  phone_number: string | null;

  @ApiProperty({
    description: 'Montant cible initial en FCFA',
    example: 50000,
  })
  initial_amount: number;

  @ApiProperty({
    description: 'Solde actuel en FCFA',
    example: 25000,
  })
  current_balance: number;

  @ApiProperty({
    description: `
    URL du QR code généré pour cette carte.
    
    **Utilisation :**
    - Scan pour accéder à la page de contribution
    - Contient l'ID de la carte pour traçabilité
    - Généré automatiquement à la création
    `,
    example: '/uploads/qr-codes/CARD-2025-000001.png',
    nullable: true,
    readOnly: true,
  })
  qr_code_url: string | null;

  @ApiProperty({
    description: `
    Indique si la carte est physique ou virtuelle.
    
    **Impact :**
    - Physique : QR code imprimable, collecte en espèces possible
    - Virtuelle : Affichage écran uniquement, contributions en ligne
    `,
    example: false,
  })
  is_physical: boolean;

  @ApiProperty({
    description: 'Statut de la carte',
    enum: CardStatus,
    example: CardStatus.ACTIVE,
  })
  status: CardStatus;

  @ApiProperty({
    description: 'Nombre de contributions',
    example: 5,
  })
  contributions_count: number;

  @ApiProperty({
    description: 'Date de creation',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de derniere mise a jour',
  })
  updated_at: Date;
}

export class QueryCardsDto {
  @ApiPropertyOptional({
    description: 'Filtrer par campagne',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  campaign_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par utilisateur',
    example: 123,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: CardStatus,
  })
  @IsOptional()
  @IsEnum(CardStatus)
  status?: CardStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par type de carte',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_physical?: boolean;

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