import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryParishesDto {
  @ApiPropertyOptional({
    description: 'Numero de page',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La page doit etre un nombre' })
  @Min(1, { message: 'La page doit etre superieure a 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'elements par page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La limite doit etre un nombre' })
  @Min(1, { message: 'La limite doit etre superieure a 0' })
  @Max(100, { message: 'La limite ne peut pas depasser 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Terme de recherche (nom ou adresse)',
    example: 'Saint-Pierre',
  })
  @IsOptional()
  @IsString({ message: 'Le terme de recherche doit etre une chaine' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Champ pour le tri',
    example: 'name',
    enum: ['name', 'created_at', 'updated_at'],
    default: 'created_at',
  })
  @IsOptional()
  @IsString({ message: 'Le champ de tri doit etre une chaine' })
  @IsIn(['name', 'created_at', 'updated_at'], {
    message: 'Le tri doit etre: name, created_at, updated_at',
  })
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString({ message: 'L\'ordre de tri doit etre une chaine' })
  @Transform(({ value }) => value?.toUpperCase())
  @IsIn(['ASC', 'DESC'], {
    message: 'L\'ordre de tri doit etre ASC ou DESC',
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}