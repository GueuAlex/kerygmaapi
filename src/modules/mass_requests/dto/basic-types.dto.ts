import { ApiProperty } from '@nestjs/swagger';

export class RequesterUserBasicDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nom complet de l\'utilisateur',
    example: 'Jean Baptiste Kouassi',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'jean.kouassi@example.com',
  })
  email: string;
}

export class MassRequestTypeBasicDto {
  @ApiProperty({
    description: 'ID du type de demande',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du type de demande',
    example: 'Messe pour un défunt',
  })
  name: string;

  @ApiProperty({
    description: 'Montant de base',
    example: 5000,
  })
  base_amount: number;
}