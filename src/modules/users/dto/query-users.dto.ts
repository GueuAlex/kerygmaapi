import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Recherche par nom ou email',
    example: 'jean'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: UserStatus
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page doit être un nombre entier' })
  @Min(1, { message: 'Page doit être supérieure à 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit doit être un nombre entier' })
  @Min(1, { message: 'Limit doit être supérieure à 0' })
  @Max(100, { message: 'Limit ne peut pas dépasser 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Trier par champ',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'fullName', 'email']
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'fullName', 'email'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}