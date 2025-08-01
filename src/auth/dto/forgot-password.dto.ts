import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@digifaz.com',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@digifaz.com',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @ApiProperty({
    description: 'Code OTP à 6 chiffres reçu par email/SMS',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: "L'OTP doit être une chaîne de caractères" })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de réinitialisation reçu après validation OTP',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Le token de réinitialisation est requis' })
  resetToken: string;

  @ApiProperty({
    description:
      'Nouveau mot de passe (8-50 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial)',
    example: 'NouveauMotDePasse123*',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(50, {
    message: 'Le mot de passe ne peut pas dépasser 50 caractères',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation du nouveau mot de passe',
    example: 'NouveauMotDePasse123*',
  })
  @IsString({ message: 'La confirmation du mot de passe est requise' })
  confirmPassword: string;
}
