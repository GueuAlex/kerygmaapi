import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'user@digifaz.com',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'password123',
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
    example: 'user@digifaz.com',
  })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'password123',
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
  phone?: string;
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
      role: 'user',
      status: 'active',
    },
  })
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
  };
}
