import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de l\'utilisateur',
    example: 'uuid-1234-5678-9012'
  })
  id: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'user@digifaz.com'
  })
  email: string;

  @ApiProperty({
    description: 'Nom complet de l\'utilisateur',
    example: 'Jean Dupont'
  })
  fullName: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+237690123456',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Rôles de l\'utilisateur',
    example: ['volunteer'],
    type: [String]
  })
  roles: string[];

  @ApiProperty({
    description: 'Permissions de l\'utilisateur basées sur ses rôles',
    example: ['users.read', 'offerings.create'],
    type: [String]
  })
  permissions: string[];

  @ApiProperty({
    description: 'Statut du compte utilisateur',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export class UsersListResponseDto {
  @ApiProperty({
    description: 'Liste des utilisateurs',
    type: [UserResponseDto]
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Nombre total d\'utilisateurs',
    example: 25
  })
  total: number;

  @ApiProperty({
    description: 'Page actuelle',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Nombre d\'éléments par page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Nombre total de pages',
    example: 3
  })
  totalPages: number;
}