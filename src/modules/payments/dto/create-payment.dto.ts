import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { GatewayType } from '../enums/gateway-type.enum';

export class CreatePaymentDto {
  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur effectuant le paiement',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID('4', { message: 'user_id doit etre un UUID valide' })
  readonly user_id?: string;

  @ApiProperty({
    description: 'ID de la passerelle de paiement',
    example: 1
  })
  @IsNumber({}, { message: 'gateway_id doit etre un nombre' })
  readonly gateway_id: number;

  @ApiProperty({
    description: 'Montant en FCFA',
    example: 5000,
    minimum: 1
  })
  @IsNumber({}, { message: 'amount doit etre un nombre' })
  @Min(1, { message: 'Le montant doit etre superieur a 0' })
  readonly amount: number;

  @ApiProperty({
    description: 'Code devise',
    example: 'XOF',
    default: 'XOF'
  })
  @IsString({ message: 'currency doit etre une chaine' })
  readonly currency: string = 'XOF';

  @ApiProperty({
    description: 'Type de transaction',
    enum: TransactionType,
    example: TransactionType.OFFERING
  })
  @IsEnum(TransactionType, { message: 'transaction_type invalide' })
  readonly transaction_type: TransactionType;

  @ApiProperty({
    description: 'ID de l\'objet lie a la transaction',
    example: 123
  })
  @IsNumber({}, { message: 'related_object_id doit etre un nombre' })
  readonly related_object_id: number;

  @ApiPropertyOptional({
    description: 'Donnees supplementaires pour le paiement',
    example: { external_reference: 'PAY-2024-001', customer_phone: '+225XXXXXXXX' }
  })
  @IsOptional()
  @IsObject({ message: 'meta doit etre un objet' })
  readonly meta?: Record<string, any>;
}

export class UpdateTransactionStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la transaction',
    enum: TransactionStatus,
    example: TransactionStatus.SUCCESS
  })
  @IsEnum(TransactionStatus, { message: 'status invalide' })
  readonly status: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Reference externe de la transaction',
    example: 'EXT-TXN-123456789'
  })
  @IsOptional()
  @IsString({ message: 'external_reference doit etre une chaine' })
  readonly external_reference?: string;

  @ApiPropertyOptional({
    description: 'Donnees supplementaires de la transaction',
    example: { gateway_response: 'approved', fee: 50 }
  })
  @IsOptional()
  @IsObject({ message: 'meta doit etre un objet' })
  readonly meta?: Record<string, any>;
}

export class TransactionResponseDto {
  @ApiProperty({ description: 'ID de la transaction' })
  id: number;

  @ApiProperty({ description: 'Reference unique de la transaction' })
  reference: string;

  @ApiProperty({ description: 'Montant en FCFA' })
  amount: number;

  @ApiProperty({ description: 'Code devise' })
  currency: string;

  @ApiProperty({ description: 'Statut du paiement', enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ description: 'Type de transaction', enum: TransactionType })
  transaction_type: TransactionType;

  @ApiProperty({ description: 'ID de l\'objet lie' })
  related_object_id: number;

  @ApiPropertyOptional({ description: 'Reference externe' })
  external_reference?: string;

  @ApiPropertyOptional({ description: 'Donnees supplementaires' })
  meta?: Record<string, any>;

  @ApiProperty({ description: 'Date de creation' })
  created_at: Date;

  @ApiProperty({ description: 'Date de mise a jour' })
  updated_at: Date;
}

export class PaymentGatewayResponseDto {
  @ApiProperty({ description: 'ID de la passerelle' })
  id: number;

  @ApiProperty({ description: 'Nom de la passerelle' })
  name: string;

  @ApiProperty({ 
    description: 'Type de passerelle', 
    enum: ['mobile_money', 'card', 'bank_transfer'] 
  })
  type: string;

  @ApiPropertyOptional({ description: 'Slug de la passerelle', enum: GatewayType })
  slug?: GatewayType;

  @ApiPropertyOptional({ description: 'URL du logo' })
  logo?: string;

  @ApiProperty({ description: 'Configuration de la passerelle' })
  config: Record<string, any>;

  @ApiPropertyOptional({ description: 'Pourcentage de frais de transaction' })
  transaction_fee_percentage?: number;

  @ApiProperty({ 
    description: 'Qui paie les frais de transaction',
    enum: ['donor', 'parish', 'shared'],
    default: 'donor'
  })
  transaction_fee_payer: string;

  @ApiProperty({ description: 'Statut actif' })
  is_active: boolean;

  @ApiProperty({ description: 'Date de creation' })
  created_at: Date;

  @ApiProperty({ description: 'Date de mise a jour' })
  updated_at: Date;
}
