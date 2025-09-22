import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  UpdateTransactionStatusDto,
  TransactionResponseDto,
  PaymentGatewayResponseDto,
} from './dto/create-payment.dto';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { TransactionType } from './entities/transaction.entity';
import { multerConfig } from '../../config/multer.config';

@ApiTags('Paiements et Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ===================== TRANSACTIONS =====================

  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle transaction',
    description: 'Initie une nouvelle transaction de paiement via une passerelle'
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction créée avec succès',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Passerelle de paiement non trouvée ou inactive',
  })
  async createTransaction(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<TransactionResponseDto> {
    return this.paymentsService.createTransaction(createPaymentDto);
  }

  @Get('transactions/:id')
  @ApiOperation({
    summary: 'Récupérer une transaction par ID',
    description: 'Récupère les détails d\'une transaction spécifique'
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction trouvée',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction non trouvée',
  })
  async findTransactionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponseDto> {
    return this.paymentsService.findTransactionById(id);
  }

  @Get('transactions/reference/:reference')
  @ApiOperation({
    summary: 'Récupérer une transaction par référence',
    description: 'Récupère les détails d\'une transaction via sa référence unique'
  })
  @ApiParam({ name: 'reference', description: 'Référence unique de la transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction trouvée',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction non trouvée',
  })
  async findTransactionByReference(
    @Param('reference') reference: string,
  ): Promise<TransactionResponseDto> {
    return this.paymentsService.findTransactionByReference(reference);
  }

  @Patch('transactions/:id/status')
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'une transaction',
    description: 'Met à jour le statut et les métadonnées d\'une transaction (webhook)'
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction non trouvée',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de modifier une transaction finalisée',
  })
  async updateTransactionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransactionStatusDto,
  ): Promise<TransactionResponseDto> {
    return this.paymentsService.updateTransactionStatus(id, updateDto);
  }

  @Get('transactions/type/:type')
  @ApiOperation({
    summary: 'Lister les transactions par type',
    description: 'Récupère toutes les transactions d\'un type donné'
  })
  @ApiParam({ name: 'type', enum: TransactionType, description: 'Type de transaction' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre maximum de résultats (défaut: 50)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des transactions',
    type: [TransactionResponseDto],
  })
  async findTransactionsByType(
    @Param('type') type: TransactionType,
    @Query('limit') limit?: number,
  ): Promise<TransactionResponseDto[]> {
    return this.paymentsService.findTransactionsByType(type, limit || 50);
  }

  @Get('transactions/:type/:objectId')
  @ApiOperation({
    summary: 'Lister les transactions par objet lié',
    description: 'Récupère toutes les transactions liées à un objet spécifique'
  })
  @ApiParam({ name: 'type', enum: TransactionType, description: 'Type de transaction' })
  @ApiParam({ name: 'objectId', description: 'ID de l\'objet lié' })
  @ApiResponse({
    status: 200,
    description: 'Liste des transactions pour l\'objet',
    type: [TransactionResponseDto],
  })
  async findTransactionsByRelatedObject(
    @Param('type') type: TransactionType,
    @Param('objectId', ParseIntPipe) objectId: number,
  ): Promise<TransactionResponseDto[]> {
    return this.paymentsService.findTransactionsByRelatedObject(type, objectId);
  }

  // ===================== PASSERELLES DE PAIEMENT =====================

  @Get('gateways')
  @ApiOperation({
    summary: 'Lister toutes les passerelles de paiement',
    description: 'Récupère toutes les passerelles de paiement actives'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des passerelles',
    type: [PaymentGatewayResponseDto],
  })
  async findAllGateways(): Promise<PaymentGatewayResponseDto[]> {
    return this.paymentsService.findAllGateways();
  }

  @Get('gateways/:id')
  @ApiOperation({
    summary: 'Récupérer une passerelle par ID',
    description: 'Récupère les détails d\'une passerelle de paiement spécifique'
  })
  @ApiParam({ name: 'id', description: 'ID de la passerelle' })
  @ApiResponse({
    status: 200,
    description: 'Passerelle trouvée',
    type: PaymentGatewayResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Passerelle non trouvée',
  })
  async findGatewayById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PaymentGatewayResponseDto> {
    return this.paymentsService.findGatewayById(id);
  }

  @Post('gateways')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('logo', multerConfig))
  @ApiOperation({
    summary: 'Créer une nouvelle passerelle de paiement',
    description: 'Crée une nouvelle passerelle avec upload de logo optionnel'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Passerelle créée avec succès',
    type: PaymentGatewayResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou fichier non autorisé',
  })
  async createGateway(
    @Body() createGatewayDto: CreateGatewayDto,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<PaymentGatewayResponseDto> {
    return this.paymentsService.createGateway(createGatewayDto, logo);
  }

  @Put('gateways/:id')
  @UseInterceptors(FileInterceptor('logo', multerConfig))
  @ApiOperation({
    summary: 'Modifier une passerelle de paiement',
    description: 'Modifie une passerelle existante avec upload de logo optionnel'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID de la passerelle' })
  @ApiResponse({
    status: 200,
    description: 'Passerelle modifiée avec succès',
    type: PaymentGatewayResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Passerelle non trouvée',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou fichier non autorisé',
  })
  async updateGateway(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGatewayDto: UpdateGatewayDto,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<PaymentGatewayResponseDto> {
    return this.paymentsService.updateGateway(id, updateGatewayDto, logo);
  }
}
