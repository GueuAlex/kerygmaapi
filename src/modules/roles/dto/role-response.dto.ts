import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'ID du rôle',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du rôle',
    example: 'treasurer',
  })
  name: string;

  @ApiProperty({
    description: 'Description du rôle',
    example: 'Tresorier avec acces aux fonctions financieres',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Permissions du rôle',
    example: {
      users: ['read'],
      parishes: ['read'],
      masses: ['read'],
      offerings: ['create', 'read', 'update'],
      contributions: ['create', 'read', 'update'],
      payments: ['create', 'read', 'update'],
      reports: ['create', 'read']
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
      users: ['read'],
      parishes: ['read'],
      masses: ['create', 'read', 'update'],
      offerings: ['create', 'read', 'update'],
      contributions: ['create', 'read', 'update'],
      payments: ['create', 'read', 'update'],
      reports: ['create', 'read']
    },
  })
  effectivePermissions: Record<string, string[]>;
}