import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nom complet de l\'utilisateur',
    example: 'Jean Dupont',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nom doit être une chaine' })
  @IsNotEmpty({ message: 'Nom ne peut pas être vide' })
  fullName?: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'user@digifaz.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+237690123456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Téléphone doit être une chaine' })
  phone?: string;

  @ApiProperty({
    description: 'Statut du compte utilisateur',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Statut invalide' })
  status?: UserStatus;
}