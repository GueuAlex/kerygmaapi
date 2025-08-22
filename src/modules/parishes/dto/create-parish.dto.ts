import {
  IsString,
  IsEmail,
  IsOptional,
  IsObject,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParishDto {
  @ApiProperty({
    description: 'Nom de la paroisse',
    example: 'Paroisse Saint-Pierre de Yamoussoukro',
    maxLength: 255,
  })
  @IsString({ message: 'Le nom doit etre une chaine de caracteres' })
  @IsNotEmpty({ message: 'Le nom de la paroisse est obligatoire' })
  @MaxLength(255, { message: 'Le nom ne peut pas depasser 255 caracteres' })
  readonly name: string;

  @ApiProperty({
    description: 'Adresse complete de la paroisse',
    example: 'BP 1234, Quartier Administratif, Yamoussoukro, Cote d\'Ivoire',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'L\'adresse doit etre une chaine de caracteres' })
  readonly address?: string;

  @ApiProperty({
    description: 'Email de contact de la paroisse',
    example: 'contact@paroisse-saint-pierre.ci',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @MaxLength(150, { message: 'L\'email ne peut pas depasser 150 caracteres' })
  readonly contact_email?: string;

  @ApiProperty({
    description: 'Numero de telephone principal',
    example: '+225 07 12 34 56 78',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le telephone doit etre une chaine de caracteres' })
  @MaxLength(20, { message: 'Le telephone ne peut pas depasser 20 caracteres' })
  readonly contact_phone?: string;

  @ApiProperty({
    description: 'Informations bancaires de la paroisse',
    example: {
      bank_name: 'BACI',
      account_number: '12345678901234567890',
      iban: 'CI93CI0240151200000012345',
      bic: 'BACICIAB',
      account_holder: 'Paroisse Saint-Pierre',
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Les informations bancaires doivent etre un objet' })
  readonly bank_account_info?: {
    bank_name?: string;
    account_number?: string;
    iban?: string;
    bic?: string;
    account_holder?: string;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Numeros de mobile money de la paroisse',
    example: {
      orange_money: '07 12 34 56 78',
      mtn_money: '05 87 65 43 21',
      wave: '01 23 45 67 89',
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Les numeros mobile money doivent etre un objet' })
  readonly mobile_money_numbers?: {
    orange_money?: string;
    mtn_money?: string;
    wave?: string;
    moov_money?: string;
    [key: string]: any;
  };
}