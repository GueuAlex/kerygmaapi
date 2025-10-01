import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'test@test.com',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'P@ssword',
  })
  @IsString({ message: 'Mot de passe doit être une chaine' })
  @IsNotEmpty({ message: 'Mot de passe requis' })
  @MinLength(6, { message: 'Mot de passe doit avoir au moins 6 caractères' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'Jean Dupont',
  })
  @IsString({ message: 'Nom doit être une chaine' })
  @IsNotEmpty({ message: 'Nom requis' })
  fullName: string;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'test@test.com',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'P@ssword',
  })
  @IsString({ message: 'Mot de passe doit être une chaine' })
  @IsNotEmpty({ message: 'Mot de passe requis' })
  @MinLength(6, { message: 'Mot de passe doit avoir au moins 6 caractères' })
  password: string;

  @ApiProperty({
    description: 'Numéro de téléphone (optionnel)',
    example: '+237690123456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Téléphone doit être une chaine' })
  phone?: string;

  @ApiProperty({
    description: "Rôle par défaut de l'utilisateur (optionnel, défaut: parishioner)",
    enum: ['super_admin', 'parish_manager', 'priest', 'treasurer', 'secretary', 'volunteer', 'parishioner'],
    example: 'parishioner',
    required: false,
  })
  @IsOptional()
  @IsEnum(['super_admin', 'parish_manager', 'priest', 'treasurer', 'secretary', 'volunteer', 'parishioner'], {
    message: 'Rôle doit être: super_admin, parish_manager, priest, treasurer, secretary, volunteer ou parishioner',
  })
  defaultRole?: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "Token JWT d'accès",
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Informations utilisateur',
    example: {
      id: 'uuid-1234-5678-9012',
      email: 'user@digifaz.com',
      fullName: 'Jean Dupont',
      status: 'active',
      roles: ['volunteer'],
      permissions: ['users.read', 'masses.read', 'parishes.read'],
    },
  })
  user: {
    id: string;
    email: string;
    fullName: string;
    status: string;
    roles: string[];
    permissions: string[];
  };
}
