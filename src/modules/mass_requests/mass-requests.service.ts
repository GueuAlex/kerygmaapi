import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MassRequestType } from './entities/mass-request-type.entity';
import { MassRequestPackage } from './entities/mass-request-package.entity';
import { MassRequest } from './entities/mass-request.entity';
import { MassRequestDetail } from './entities/mass-request-detail.entity';
import { MassRequestSchedule } from './entities/mass-request-schedule.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateMassRequestTypeDto,
  UpdateMassRequestTypeDto,
  MassRequestTypeResponseDto,
  CreateMassRequestDto,
  UpdateMassRequestDto,
  QueryMassRequestsDto,
  MassRequestResponseDto,
  PaginatedMassRequestsResponseDto,
  MassRequestStatus,
} from './dto';

@Injectable()
export class MassRequestsService {
  constructor(
    @InjectRepository(MassRequestType)
    private readonly massRequestTypeRepository: Repository<MassRequestType>,
    @InjectRepository(MassRequestPackage)
    private readonly massRequestPackageRepository: Repository<MassRequestPackage>,
    @InjectRepository(MassRequest)
    private readonly massRequestRepository: Repository<MassRequest>,
    @InjectRepository(MassRequestDetail)
    private readonly massRequestDetailRepository: Repository<MassRequestDetail>,
    @InjectRepository(MassRequestSchedule)
    private readonly massRequestScheduleRepository: Repository<MassRequestSchedule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ========== MASS REQUEST TYPES ==========

  async createMassRequestType(createDto: CreateMassRequestTypeDto): Promise<MassRequestTypeResponseDto> {
    // Vérifier l'unicité du nom
    const existingType = await this.massRequestTypeRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingType) {
      throw new ConflictException(`Un type de demande avec le nom "${createDto.name}" existe déjà`);
    }

    const massRequestType = this.massRequestTypeRepository.create(createDto);
    const savedType = await this.massRequestTypeRepository.save(massRequestType);

    return this.mapMassRequestTypeToResponse(savedType);
  }

  async findAllMassRequestTypes(activeOnly: boolean = false): Promise<MassRequestTypeResponseDto[]> {
    const whereClause = activeOnly ? { is_active: true } : {};
    
    const types = await this.massRequestTypeRepository.find({
      where: whereClause,
      order: { name: 'ASC' },
    });

    return types.map(type => this.mapMassRequestTypeToResponse(type));
  }

  async findMassRequestTypeById(id: number): Promise<MassRequestTypeResponseDto> {
    const type = await this.massRequestTypeRepository.findOne({ where: { id } });

    if (!type) {
      throw new NotFoundException(`Type de demande de messe avec l'ID ${id} non trouvé`);
    }

    return this.mapMassRequestTypeToResponse(type);
  }

  async updateMassRequestType(id: number, updateDto: UpdateMassRequestTypeDto): Promise<MassRequestTypeResponseDto> {
    const type = await this.massRequestTypeRepository.findOne({ where: { id } });

    if (!type) {
      throw new NotFoundException(`Type de demande de messe avec l'ID ${id} non trouvé`);
    }

    // Vérifier l'unicité du nom si modifié
    if (updateDto.name && updateDto.name !== type.name) {
      const existingType = await this.massRequestTypeRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingType) {
        throw new ConflictException(`Un type de demande avec le nom "${updateDto.name}" existe déjà`);
      }
    }

    Object.assign(type, updateDto);
    const updatedType = await this.massRequestTypeRepository.save(type);

    return this.mapMassRequestTypeToResponse(updatedType);
  }

  async deleteMassRequestType(id: number): Promise<{ message: string }> {
    const type = await this.massRequestTypeRepository.findOne({ where: { id } });

    if (!type) {
      throw new NotFoundException(`Type de demande de messe avec l'ID ${id} non trouvé`);
    }

    // Vérifier s'il y a des demandes liées
    const requestsCount = await this.massRequestRepository.count({
      where: { mass_request_type: { id } },
    });

    if (requestsCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce type. ${requestsCount} demande(s) de messe y sont associée(s).`
      );
    }

    await this.massRequestTypeRepository.remove(type);

    return { message: `Type de demande "${type.name}" supprimé avec succès` };
  }

  // ========== MASS REQUESTS ==========

  async createMassRequest(createDto: CreateMassRequestDto, currentUserId?: string): Promise<MassRequestResponseDto> {
    // Vérifier que le type de demande existe
    const massRequestType = await this.massRequestTypeRepository.findOne({
      where: { id: createDto.mass_request_type_id, is_active: true },
    });

    if (!massRequestType) {
      throw new NotFoundException(`Type de demande avec l'ID ${createDto.mass_request_type_id} non trouvé ou inactif`);
    }

    let requesterUser: User | null = null;
    
    // Si un ID utilisateur est fourni ou si l'utilisateur est connecté
    const userIdToUse = createDto.requester_user_id || currentUserId;
    if (userIdToUse) {
      const foundUser = await this.userRepository.findOne({ where: { id: userIdToUse } });
      if (!foundUser) {
        throw new NotFoundException(`Utilisateur avec l'ID ${userIdToUse} non trouvé`);
      }
      requesterUser = foundUser;
    }

    // Calculer le montant total si non fourni
    const totalAmount = createDto.total_amount || massRequestType.base_amount;

    const massRequest = this.massRequestRepository.create({
      requester_name: createDto.requester_name,
      requester_phone: createDto.requester_phone,
      requester_email: createDto.requester_email,
      message_additionnel: createDto.message_additionnel,
      total_amount: totalAmount,
      status: MassRequestStatus.PENDING_PAYMENT,
    });

    if (requesterUser) {
      massRequest.requester_user = requesterUser;
    }
    massRequest.mass_request_type = massRequestType;

    const savedRequest = await this.massRequestRepository.save(massRequest);

    return this.findMassRequestById(savedRequest.id);
  }

  async findAllMassRequests(queryDto: QueryMassRequestsDto): Promise<PaginatedMassRequestsResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      mass_request_type_id,
      start_date,
      end_date,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.massRequestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.mass_request_type', 'type')
      .leftJoinAndSelect('request.requester_user', 'user')
      .orderBy(`request.${sortBy}`, sortOrder);

    // Filtres
    if (search) {
      queryBuilder.andWhere(
        '(request.requester_name LIKE :search OR request.requester_email LIKE :search OR request.requester_phone LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (mass_request_type_id) {
      queryBuilder.andWhere('type.id = :mass_request_type_id', { mass_request_type_id });
    }

    if (start_date) {
      queryBuilder.andWhere('DATE(request.created_at) >= :start_date', { start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('DATE(request.created_at) <= :end_date', { end_date });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: requests.map(request => this.mapMassRequestToResponse(request)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findMassRequestById(id: number): Promise<MassRequestResponseDto> {
    const request = await this.massRequestRepository.findOne({
      where: { id },
      relations: ['mass_request_type', 'requester_user'],
    });

    if (!request) {
      throw new NotFoundException(`Demande de messe avec l'ID ${id} non trouvée`);
    }

    return this.mapMassRequestToResponse(request);
  }

  async updateMassRequest(id: number, updateDto: UpdateMassRequestDto): Promise<MassRequestResponseDto> {
    const request = await this.massRequestRepository.findOne({
      where: { id },
      relations: ['mass_request_type', 'requester_user'],
    });

    if (!request) {
      throw new NotFoundException(`Demande de messe avec l'ID ${id} non trouvée`);
    }

    // Vérifier le nouveau type de demande si modifié
    if (updateDto.mass_request_type_id) {
      const massRequestType = await this.massRequestTypeRepository.findOne({
        where: { id: updateDto.mass_request_type_id },
      });

      if (!massRequestType) {
        throw new NotFoundException(`Type de demande avec l'ID ${updateDto.mass_request_type_id} non trouvé`);
      }

      request.mass_request_type = massRequestType;
    }

    // Gérer l'annulation
    if (updateDto.status === MassRequestStatus.CANCELLED && !request.cancelled_at) {
      request.cancelled_at = new Date();
    }

    // Mettre à jour les autres champs
    Object.assign(request, updateDto);
    const updatedRequest = await this.massRequestRepository.save(request);

    return this.findMassRequestById(updatedRequest.id);
  }

  async cancelMassRequest(id: number, reason?: string): Promise<MassRequestResponseDto> {
    const request = await this.massRequestRepository.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException(`Demande de messe avec l'ID ${id} non trouvée`);
    }

    if (request.status === MassRequestStatus.COMPLETED) {
      throw new BadRequestException('Impossible d\'annuler une demande déjà complétée');
    }

    if (request.status === MassRequestStatus.CANCELLED) {
      throw new BadRequestException('Cette demande est déjà annulée');
    }

    request.status = MassRequestStatus.CANCELLED;
    request.cancellation_reason = reason || 'Annulation sans raison spécifiée';
    request.cancelled_at = new Date();

    await this.massRequestRepository.save(request);

    return this.findMassRequestById(id);
  }

  async deleteMassRequest(id: number): Promise<{ message: string }> {
    const request = await this.massRequestRepository.findOne({
      where: { id },
      relations: ['mass_request_type'],
    });

    if (!request) {
      throw new NotFoundException(`Demande de messe avec l'ID ${id} non trouvée`);
    }

    const requestInfo = `${request.mass_request_type.name} de ${request.requester_name}`;
    await this.massRequestRepository.remove(request);

    return { message: `Demande de messe "${requestInfo}" supprimée avec succès` };
  }

  async getMassRequestsStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalAmount: number;
    averageAmount: number;
  }> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, today_count, week_count, month_count] = await Promise.all([
      this.massRequestRepository.count(),
      this.massRequestRepository
        .createQueryBuilder('request')
        .where('DATE(request.created_at) = :today', { today: today.toISOString().split('T')[0] })
        .getCount(),
      this.massRequestRepository
        .createQueryBuilder('request')
        .where('request.created_at >= :weekStart', { weekStart })
        .getCount(),
      this.massRequestRepository
        .createQueryBuilder('request')
        .where('request.created_at >= :monthStart', { monthStart })
        .getCount(),
    ]);

    // Statistiques par statut
    const statusStats = await this.massRequestRepository
      .createQueryBuilder('request')
      .select('request.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('request.status')
      .getRawMany();

    const byStatus = {};
    statusStats.forEach(stat => {
      byStatus[stat.status] = parseInt(stat.count);
    });

    // Statistiques par type
    const typeStats = await this.massRequestRepository
      .createQueryBuilder('request')
      .leftJoin('request.mass_request_type', 'type')
      .select('type.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('type.id')
      .getRawMany();

    const byType = {};
    typeStats.forEach(stat => {
      byType[stat.name] = parseInt(stat.count);
    });

    // Statistiques financières
    const financialStats = await this.massRequestRepository
      .createQueryBuilder('request')
      .select('SUM(request.total_amount)', 'total')
      .addSelect('AVG(request.total_amount)', 'average')
      .where('request.status IN (:...statuses)', {
        statuses: [MassRequestStatus.PAID, MassRequestStatus.SCHEDULED, MassRequestStatus.COMPLETED],
      })
      .getRawOne();

    return {
      total,
      today: today_count,
      thisWeek: week_count,
      thisMonth: month_count,
      byStatus,
      byType,
      totalAmount: parseFloat(financialStats.total) || 0,
      averageAmount: parseFloat(financialStats.average) || 0,
    };
  }

  // ========== MÉTHODES PRIVÉES ==========

  private mapMassRequestTypeToResponse(type: MassRequestType): MassRequestTypeResponseDto {
    return {
      id: type.id,
      name: type.name,
      description: type.description,
      base_amount: type.base_amount,
      template_details: type.template_details,
      is_active: type.is_active,
      created_at: type.created_at,
      updated_at: type.updated_at,
    };
  }

  private mapMassRequestToResponse(request: MassRequest): MassRequestResponseDto {
    return {
      id: request.id,
      requester_user: request.requester_user
        ? {
            id: request.requester_user.id,
            fullName: request.requester_user.fullName,
            email: request.requester_user.email,
          }
        : null,
      requester_name: request.requester_name,
      requester_phone: request.requester_phone,
      requester_email: request.requester_email,
      mass_request_type: {
        id: request.mass_request_type.id,
        name: request.mass_request_type.name,
        base_amount: request.mass_request_type.base_amount,
      },
      message_additionnel: request.message_additionnel,
      status: request.status as MassRequestStatus,
      total_amount: request.total_amount,
      payment_id: request.payment_id,
      cancellation_reason: request.cancellation_reason,
      cancelled_at: request.cancelled_at,
      created_at: request.created_at,
      updated_at: request.updated_at,
    };
  }
}
