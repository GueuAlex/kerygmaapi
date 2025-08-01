import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 'uuid-1234-5678-9012',
  })
  @IsString({ message: 'L\'ID utilisateur doit être une chaîne de caractères' })
  userId: string;

  @ApiProperty({
    description: 'ID du rôle à assigner',
    example: 1,
  })
  @IsNumber({}, { message: 'L\'ID du rôle doit être un nombre' })
  roleId: number;
}