import { IsString, IsEnum, IsOptional, IsBoolean, IsObject, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GatewayType } from '../enums/gateway-type.enum';
import { Type } from 'class-transformer';

export class CreateGatewayDto {
  @ApiProperty({
    description: 'Nom du gateway de paiement',
    example: 'Orange Money Burkina Faso'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type du gateway',
    enum: ['mobile_money', 'card', 'bank_transfer'],
    example: 'mobile_money'
  })
  @IsEnum(['mobile_money', 'card', 'bank_transfer'])
  type: string;

  @ApiProperty({
    description: 'Slug du gateway',
    enum: GatewayType,
    example: GatewayType.OM
  })
  @IsEnum(GatewayType)
  slug: GatewayType;

  @ApiPropertyOptional({
    description: 'Configuration d\'integration du gateway (cles API, URLs, etc.)',
    example: {
      api_key: 'your_api_key',
      api_secret: 'your_api_secret',
      base_url: 'https://api.gateway.com'
    }
  })
  @IsOptional()
  @IsObject()
  integration_config?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Logo du gateway (fichier image)',
    type: 'string',
    format: 'binary'
  })
  @IsOptional()
  logo?: any;

  @ApiPropertyOptional({
    description: 'Pourcentage de frais de transaction (0-100)',
    example: 2.5,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  transaction_fee_percentage?: number;

  @ApiPropertyOptional({
    description: 'Qui supporte les frais de transaction',
    enum: ['donor', 'parish', 'shared'],
    default: 'donor'
  })
  @IsOptional()
  @IsEnum(['donor', 'parish', 'shared'])
  transaction_fee_payer?: string;

  @ApiPropertyOptional({
    description: 'Statut actif du gateway',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}