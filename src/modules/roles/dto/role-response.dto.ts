import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'ID du rôle',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du rôle',
    example: 'gestionnaire_finances',
  })
  name: string;

  @ApiProperty({
    description: 'Description du rôle',
    example: 'Gestionnaire des finances de la paroisse',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Permissions du rôle',
    example: {
      finances: ['read', 'write'],
      users: ['read']
    },
    required: false,
  })
  permissions?: Record<string, any>;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-01-01T00:00:00.000Z',
  })
  created_at: Date;
}

export class UserRolesResponseDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'uuid-1234-5678-9012',
  })
  userId: string;

  @ApiProperty({
    description: 'Rôles assignés à l\'utilisateur',
    type: [RoleResponseDto],
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: 'Permissions effectives calculées',
    example: {
      finances: ['read', 'write'],
      users: ['read'],
      reports: ['read']
    },
  })
  effectivePermissions: Record<string, string[]>;
}