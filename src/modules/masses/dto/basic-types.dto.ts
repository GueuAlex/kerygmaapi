import { ApiProperty } from '@nestjs/swagger';

export class CelebrationTypeBasicDto {
  @ApiProperty({
    description: 'Identifiant du type de célébration',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du type de célébration',
    example: 'Messe dominicale',
  })
  name: string;
}