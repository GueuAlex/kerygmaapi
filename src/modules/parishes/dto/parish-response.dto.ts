import { ApiProperty } from '@nestjs/swagger';
import { Parish } from '../entities/parish.entity';

export class ParishResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la paroisse',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nom de la paroisse',
    example: 'Paroisse Saint-Pierre de Yamoussoukro',
  })
  name: string;

  @ApiProperty({
    description: 'Adresse complete de la paroisse',
    example: 'BP 1234, Quartier Administratif, Yamoussoukro, Cote d\'Ivoire',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'Email de contact de la paroisse',
    example: 'contact@paroisse-saint-pierre.ci',
    nullable: true,
  })
  contact_email: string | null;

  @ApiProperty({
    description: 'Numero de telephone principal',
    example: '+225 07 12 34 56 78',
    nullable: true,
  })
  contact_phone: string | null;

  @ApiProperty({
    description: 'Informations bancaires de la paroisse',
    example: {
      bank_name: 'BACI',
      account_number: '12345678901234567890',
      iban: 'CI93CI0240151200000012345',
      bic: 'BACICIAB',
      account_holder: 'Paroisse Saint-Pierre',
    },
    nullable: true,
  })
  bank_account_info: object | null;

  @ApiProperty({
    description: 'Numeros de mobile money de la paroisse',
    example: {
      orange_money: '07 12 34 56 78',
      mtn_money: '05 87 65 43 21',
      wave: '01 23 45 67 89',
    },
    nullable: true,
  })
  mobile_money_numbers: object | null;

  @ApiProperty({
    description: 'Date de creation de la paroisse',
    example: '2025-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de derniere mise a jour',
    example: '2025-01-20T14:45:00Z',
  })
  updated_at: Date;

  static fromEntity(parish: Parish): ParishResponseDto {
    return {
      id: parish.id,
      name: parish.name,
      address: parish.address,
      contact_email: parish.contact_email,
      contact_phone: parish.contact_phone,
      bank_account_info: parish.bank_account_info,
      mobile_money_numbers: parish.mobile_money_numbers,
      created_at: parish.created_at,
      updated_at: parish.updated_at,
    };
  }
}

export class PaginatedParishesResponseDto {
  @ApiProperty({
    description: 'Liste des paroisses',
    type: [ParishResponseDto],
  })
  data: ParishResponseDto[];

  @ApiProperty({
    description: 'Informations de pagination',
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}