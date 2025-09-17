import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { CreatePaymentDto, UpdateTransactionStatusDto, TransactionResponseDto, PaymentGatewayResponseDto } from './dto/create-payment.dto';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentGateway)
    private readonly gatewayRepository: Repository<PaymentGateway>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // ===================== TRANSACTIONS =====================

  async createTransaction(createPaymentDto: CreatePaymentDto): Promise<TransactionResponseDto> {
    // Vérifier que la passerelle existe et est active
    const gateway = await this.gatewayRepository.findOne({
      where: { id: createPaymentDto.gateway_id, is_active: true }
    });

    if (!gateway) {
      throw new NotFoundException(`Passerelle de paiement ${createPaymentDto.gateway_id} non trouvée ou inactive`);
    }

    // Générer une référence unique
    const reference = this.generateTransactionReference(createPaymentDto.transaction_type);

    // Créer la transaction
    const transaction = this.transactionRepository.create({
      reference,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency,
      status: TransactionStatus.PENDING,
      transaction_type: createPaymentDto.transaction_type,
      related_object_id: createPaymentDto.related_object_id,
      user: createPaymentDto.user_id ? { id: createPaymentDto.user_id } : undefined,
      gateway,
      meta: createPaymentDto.meta,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);
    return this.mapTransactionToResponseDto(savedTransaction);
  }

  async findTransactionById(id: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'gateway']
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec l'ID ${id} non trouvée`);
    }

    return this.mapTransactionToResponseDto(transaction);
  }

  async findTransactionByReference(reference: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { reference },
      relations: ['user', 'gateway']
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec la référence ${reference} non trouvée`);
    }

    return this.mapTransactionToResponseDto(transaction);
  }

  async updateTransactionStatus(id: number, updateDto: UpdateTransactionStatusDto): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec l'ID ${id} non trouvée`);
    }

    // Empêcher la modification de transactions déjà finalisées
    if ([TransactionStatus.SUCCESS, TransactionStatus.REFUNDED].includes(transaction.status)) {
      throw new BadRequestException('Impossible de modifier une transaction déjà finalisée');
    }

    // Mettre à jour les champs
    transaction.status = updateDto.status;
    if (updateDto.external_reference) {
      transaction.external_reference = updateDto.external_reference;
    }
    if (updateDto.meta) {
      transaction.meta = { ...transaction.meta, ...updateDto.meta };
    }

    const updatedTransaction = await this.transactionRepository.save(transaction);
    return this.mapTransactionToResponseDto(updatedTransaction);
  }

  async findTransactionsByType(type: TransactionType, limit: number = 50): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { transaction_type: type },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['user', 'gateway']
    });

    return transactions.map(t => this.mapTransactionToResponseDto(t));
  }

  async findTransactionsByRelatedObject(type: TransactionType, objectId: number): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { 
        transaction_type: type,
        related_object_id: objectId 
      },
      order: { created_at: 'DESC' },
      relations: ['user', 'gateway']
    });

    return transactions.map(t => this.mapTransactionToResponseDto(t));
  }

  // ===================== PASSERELLES DE PAIEMENT =====================

  async findAllGateways(): Promise<PaymentGatewayResponseDto[]> {
    const gateways = await this.gatewayRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' }
    });

    return gateways.map(g => this.mapGatewayToResponseDto(g));
  }

  async findGatewayById(id: number): Promise<PaymentGatewayResponseDto> {
    const gateway = await this.gatewayRepository.findOne({ where: { id } });

    if (!gateway) {
      throw new NotFoundException(`Passerelle avec l'ID ${id} non trouvée`);
    }

    return this.mapGatewayToResponseDto(gateway);
  }

  async createGateway(createGatewayDto: CreateGatewayDto, logoFile?: Express.Multer.File): Promise<PaymentGatewayResponseDto> {
    let logoPath: string | undefined;

    if (logoFile) {
      logoPath = `/uploads/gateway-logos/${logoFile.filename}`;
    }

    const gateway = this.gatewayRepository.create({
      ...createGatewayDto,
      logo: logoPath,
    });

    const savedGateway = await this.gatewayRepository.save(gateway);
    return this.mapGatewayToResponseDto(savedGateway);
  }

  async updateGateway(id: number, updateGatewayDto: UpdateGatewayDto, logoFile?: Express.Multer.File): Promise<PaymentGatewayResponseDto> {
    const gateway = await this.gatewayRepository.findOne({ where: { id } });

    if (!gateway) {
      throw new NotFoundException(`Passerelle avec l'ID ${id} non trouvée`);
    }

    // Mettre à jour seulement les champs fournis dans le DTO
    Object.keys(updateGatewayDto).forEach(key => {
      if (updateGatewayDto[key] !== undefined) {
        gateway[key] = updateGatewayDto[key];
      }
    });

    // Gestion du logo seulement si un fichier est fourni
    if (logoFile) {
      // Supprimer l'ancien logo s'il existe
      if (gateway.logo) {
        try {
          const oldLogoPath = join(process.cwd(), gateway.logo);
          await unlink(oldLogoPath);
        } catch (error) {
          // Ignorer l'erreur si le fichier n'existe pas
        }
      }
      gateway.logo = `/uploads/gateway-logos/${logoFile.filename}`;
    }

    const updatedGateway = await this.gatewayRepository.save(gateway);
    return this.mapGatewayToResponseDto(updatedGateway);
  }

  // ===================== MÉTHODES UTILITAIRES =====================

  private generateTransactionReference(type: TransactionType): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = type.toUpperCase().substring(0, 3);
    return `${prefix}-${timestamp}-${random}`;
  }

  private mapTransactionToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      transaction_type: transaction.transaction_type,
      related_object_id: transaction.related_object_id,
      external_reference: transaction.external_reference,
      meta: transaction.meta,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }

  private mapGatewayToResponseDto(gateway: PaymentGateway): PaymentGatewayResponseDto {
    return {
      id: gateway.id,
      name: gateway.name,
      type: gateway.type,
      slug: gateway.slug,
      logo: gateway.logo,
      config: gateway.config,
      transaction_fee_percentage: gateway.transaction_fee_percentage,
      transaction_fee_payer: gateway.transaction_fee_payer,
      is_active: gateway.is_active,
      created_at: gateway.created_at,
      updated_at: gateway.updated_at,
    };
  }
}
