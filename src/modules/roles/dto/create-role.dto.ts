import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nom du rôle',
    example: 'gestionnaire_finances',
  })
  @IsString({ message: 'Le nom du rôle doit être une chaîne de caractères' })
  readonly name: string;

  @ApiProperty({
    description: 'Description du rôle',
    example: 'Gestionnaire des finances de la paroisse',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  readonly description?: string;

  @ApiProperty({
    description: 'Permissions du rôle (JSON)',
    example: {
      finances: ['read', 'write'],
      users: ['read'],
      reports: ['read', 'write', 'delete']
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Les permissions doivent être un objet JSON' })
  readonly permissions?: Record<string, any>;
}
