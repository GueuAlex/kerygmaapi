import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mot de passe actuel de l\'utilisateur',
    example: 'ancien_mot_de_passe123',
  })
  @IsString({ message: 'Le mot de passe actuel doit être une chaîne de caractères' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (8-50 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial)',
    example: 'NouveauMotDePasse123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(50, { message: 'Le mot de passe ne peut pas dépasser 50 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
    },
  )
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation du nouveau mot de passe',
    example: 'NouveauMotDePasse123!',
  })
  @IsString({ message: 'La confirmation du mot de passe doit être une chaîne de caractères' })
  confirmPassword: string;
}