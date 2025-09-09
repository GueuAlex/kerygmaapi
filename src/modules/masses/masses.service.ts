import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CelebrationType } from './entities/celebration-type.entity';
import { MassCalendar } from './entities/mass-calendar.entity';
import {
  CreateCelebrationTypeDto,
  UpdateCelebrationTypeDto,
  CelebrationTypeResponseDto,
  CreateMassCalendarDto,
  UpdateMassCalendarDto,
  QueryMassCalendarDto,
  MassCalendarResponseDto,
  PaginatedMassCalendarResponseDto,
  MassStatus,
} from './dto';

@Injectable()
export class MassesService {
  constructor(
    @InjectRepository(CelebrationType)
    private readonly celebrationTypeRepository: Repository<CelebrationType>,
    @InjectRepository(MassCalendar)
    private readonly massCalendarRepository: Repository<MassCalendar>,
  ) {}

  // ========== CELEBRATION TYPES ==========

  async createCelebrationType(createDto: CreateCelebrationTypeDto): Promise<CelebrationTypeResponseDto> {
    // Vérifier l'unicité du nom
    const existingType = await this.celebrationTypeRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingType) {
      throw new ConflictException(`Un type de célébration avec le nom "${createDto.name}" existe déjà`);
    }

    const celebrationType = this.celebrationTypeRepository.create(createDto);
    const savedType = await this.celebrationTypeRepository.save(celebrationType);

    return this.mapCelebrationTypeToResponse(savedType);
  }

  async findAllCelebrationTypes(): Promise<CelebrationTypeResponseDto[]> {
    const celebrationTypes = await this.celebrationTypeRepository.find({
      order: { name: 'ASC' },
    });

    return celebrationTypes.map(type => this.mapCelebrationTypeToResponse(type));
  }

  async findCelebrationTypeById(id: number): Promise<CelebrationTypeResponseDto> {
    const celebrationType = await this.celebrationTypeRepository.findOne({
      where: { id },
    });

    if (!celebrationType) {
      throw new NotFoundException(`Type de célébration avec l'ID ${id} non trouvé`);
    }

    return this.mapCelebrationTypeToResponse(celebrationType);
  }

  async updateCelebrationType(id: number, updateDto: UpdateCelebrationTypeDto): Promise<CelebrationTypeResponseDto> {
    const celebrationType = await this.celebrationTypeRepository.findOne({ where: { id } });

    if (!celebrationType) {
      throw new NotFoundException(`Type de célébration avec l'ID ${id} non trouvé`);
    }

    // Vérifier l'unicité du nom si modifié
    if (updateDto.name && updateDto.name !== celebrationType.name) {
      const existingType = await this.celebrationTypeRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingType) {
        throw new ConflictException(`Un type de célébration avec le nom "${updateDto.name}" existe déjà`);
      }
    }

    Object.assign(celebrationType, updateDto);
    const updatedType = await this.celebrationTypeRepository.save(celebrationType);

    return this.mapCelebrationTypeToResponse(updatedType);
  }

  async deleteCelebrationType(id: number): Promise<{ message: string }> {
    const celebrationType = await this.celebrationTypeRepository.findOne({ where: { id } });

    if (!celebrationType) {
      throw new NotFoundException(`Type de célébration avec l'ID ${id} non trouvé`);
    }

    // Vérifier s'il y a des messes liées
    const massesCount = await this.massCalendarRepository.count({
      where: { celebration_type: { id } },
    });

    if (massesCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce type de célébration. ${massesCount} messe(s) y sont associée(s).`
      );
    }

    await this.celebrationTypeRepository.remove(celebrationType);

    return { message: `Type de célébration "${celebrationType.name}" supprimé avec succès` };
  }

  // ========== MASS CALENDAR ==========

  async createMassCalendar(createDto: CreateMassCalendarDto, createdByUserId?: string): Promise<MassCalendarResponseDto> {
    // Valider que la date n'est pas dans le passé
    const massDate = new Date(createDto.mass_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (massDate < today) {
      throw new BadRequestException('Impossible de créer une messe dans le passé');
    }

    // Valider que l'heure de fin est après l'heure de début
    if (createDto.start_time >= createDto.end_time) {
      throw new BadRequestException('L\'heure de fin doit être postérieure à l\'heure de début');
    }

    // Vérifier que le type de célébration existe
    const celebrationType = await this.celebrationTypeRepository.findOne({
      where: { id: createDto.celebration_type_id },
    });

    if (!celebrationType) {
      throw new NotFoundException(`Type de célébration avec l'ID ${createDto.celebration_type_id} non trouvé`);
    }

    // Vérifier les conflits d'horaire
    await this.checkTimeConflict(
      createDto.mass_date,
      createDto.start_time,
      createDto.end_time,
      createDto.location
    );

    const massCalendar = this.massCalendarRepository.create({
      mass_date: createDto.mass_date,
      start_time: createDto.start_time,
      end_time: createDto.end_time,
      location: createDto.location,
      status: createDto.status || 'active',
      notes: createDto.notes,
      created_by_user_id: createdByUserId || undefined,
    });

    massCalendar.celebration_type = celebrationType;

    const savedMass = await this.massCalendarRepository.save(massCalendar);

    return this.findMassCalendarById(savedMass.id);
  }

  async findAllMassCalendar(queryDto: QueryMassCalendarDto): Promise<PaginatedMassCalendarResponseDto> {
    const { page = 1, limit = 10, start_date, end_date, celebration_type_id, status, sortBy = 'mass_date', sortOrder = 'ASC' } = queryDto;

    const queryBuilder = this.massCalendarRepository.createQueryBuilder('mass')
      .leftJoinAndSelect('mass.celebration_type', 'celebration_type')
      .orderBy(`mass.${sortBy}`, sortOrder);

    // Filtres
    if (start_date) {
      queryBuilder.andWhere('mass.mass_date >= :start_date', { start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('mass.mass_date <= :end_date', { end_date });
    }

    if (celebration_type_id) {
      queryBuilder.andWhere('celebration_type.id = :celebration_type_id', { celebration_type_id });
    }

    if (status) {
      queryBuilder.andWhere('mass.status = :status', { status });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [masses, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: masses.map(mass => this.mapMassCalendarToResponse(mass)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findMassCalendarById(id: number): Promise<MassCalendarResponseDto> {
    const mass = await this.massCalendarRepository.findOne({
      where: { id },
      relations: ['celebration_type'],
    });

    if (!mass) {
      throw new NotFoundException(`Messe avec l'ID ${id} non trouvée`);
    }

    return this.mapMassCalendarToResponse(mass);
  }

  async updateMassCalendar(id: number, updateDto: UpdateMassCalendarDto): Promise<MassCalendarResponseDto> {
    const mass = await this.massCalendarRepository.findOne({
      where: { id },
      relations: ['celebration_type'],
    });

    if (!mass) {
      throw new NotFoundException(`Messe avec l'ID ${id} non trouvée`);
    }

    // Validations conditionnelles
    if (updateDto.mass_date) {
      const massDate = new Date(updateDto.mass_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (massDate < today) {
        throw new BadRequestException('Impossible de programmer une messe dans le passé');
      }
    }

    if (updateDto.start_time && updateDto.end_time) {
      if (updateDto.start_time >= updateDto.end_time) {
        throw new BadRequestException('L\'heure de fin doit être postérieure à l\'heure de début');
      }
    }

    // Vérifier le nouveau type de célébration
    if (updateDto.celebration_type_id) {
      const celebrationType = await this.celebrationTypeRepository.findOne({
        where: { id: updateDto.celebration_type_id },
      });

      if (!celebrationType) {
        throw new NotFoundException(`Type de célébration avec l'ID ${updateDto.celebration_type_id} non trouvé`);
      }

      mass.celebration_type = celebrationType;
    }

    // Vérifier les conflits d'horaire si modification des horaires
    if (updateDto.mass_date || updateDto.start_time || updateDto.end_time || updateDto.location) {
      await this.checkTimeConflict(
        updateDto.mass_date || mass.mass_date,
        updateDto.start_time || mass.start_time,
        updateDto.end_time || mass.end_time,
        updateDto.location || mass.location,
        id
      );
    }

    // Mettre à jour les autres champs
    Object.assign(mass, updateDto);
    const updatedMass = await this.massCalendarRepository.save(mass);

    return this.findMassCalendarById(updatedMass.id);
  }

  async deleteMassCalendar(id: number): Promise<{ message: string }> {
    const mass = await this.massCalendarRepository.findOne({
      where: { id },
      relations: ['celebration_type'],
    });

    if (!mass) {
      throw new NotFoundException(`Messe avec l'ID ${id} non trouvée`);
    }

    const massName = `${mass.celebration_type.name} du ${mass.mass_date} à ${mass.start_time}`;
    await this.massCalendarRepository.remove(mass);

    return { message: `Messe "${massName}" supprimée avec succès` };
  }

  async getUpcomingMasses(limit: number = 10): Promise<MassCalendarResponseDto[]> {
    const today = new Date().toISOString().split('T')[0];

    const masses = await this.massCalendarRepository.find({
      where: {
        mass_date: MoreThanOrEqual(today),
        status: MassStatus.ACTIVE,
      },
      relations: ['celebration_type'],
      order: {
        mass_date: 'ASC',
        start_time: 'ASC',
      },
      take: limit,
    });

    return masses.map(mass => this.mapMassCalendarToResponse(mass));
  }

  async getMassesStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStatus: Record<string, number>;
    byCelebrationType: Record<string, number>;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date();
    monthStart.setDate(1);

    const [total, today_count, week_count, month_count] = await Promise.all([
      this.massCalendarRepository.count(),
      this.massCalendarRepository.count({ where: { mass_date: today } }),
      this.massCalendarRepository
        .createQueryBuilder('mass')
        .where('mass.mass_date >= :weekStart', { weekStart: weekStart.toISOString().split('T')[0] })
        .getCount(),
      this.massCalendarRepository
        .createQueryBuilder('mass')
        .where('mass.mass_date >= :monthStart', { monthStart: monthStart.toISOString().split('T')[0] })
        .getCount(),
    ]);

    // Statistiques par statut
    const statusStats = await this.massCalendarRepository
      .createQueryBuilder('mass')
      .select('mass.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('mass.status')
      .getRawMany();

    const byStatus = {};
    statusStats.forEach(stat => {
      byStatus[stat.status] = parseInt(stat.count);
    });

    // Statistiques par type de célébration
    const typeStats = await this.massCalendarRepository
      .createQueryBuilder('mass')
      .leftJoin('mass.celebration_type', 'type')
      .select('type.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('type.id')
      .getRawMany();

    const byCelebrationType = {};
    typeStats.forEach(stat => {
      byCelebrationType[stat.name] = parseInt(stat.count);
    });

    return {
      total,
      today: today_count,
      thisWeek: week_count,
      thisMonth: month_count,
      byStatus,
      byCelebrationType,
    };
  }

  // ========== MÉTHODES PRIVÉES ==========

  private async checkTimeConflict(
    mass_date: string,
    start_time: string,
    end_time: string,
    location?: string,
    excludeId?: number
  ): Promise<void> {
    const queryBuilder = this.massCalendarRepository
      .createQueryBuilder('mass')
      .where('mass.mass_date = :mass_date', { mass_date })
      .andWhere('mass.status != :cancelled', { cancelled: MassStatus.CANCELLED })
      .andWhere(
        '(mass.start_time < :end_time AND mass.end_time > :start_time)',
        { start_time, end_time }
      );

    if (location) {
      queryBuilder.andWhere('mass.location = :location', { location });
    }

    if (excludeId) {
      queryBuilder.andWhere('mass.id != :excludeId', { excludeId });
    }

    const conflictingMass = await queryBuilder.getOne();

    if (conflictingMass) {
      throw new ConflictException(
        `Conflit d'horaire détecté. Une autre messe est programmée à la même heure${location ? ' et au même lieu' : ''}.`
      );
    }
  }

  private mapCelebrationTypeToResponse(celebrationType: CelebrationType): CelebrationTypeResponseDto {
    return {
      id: celebrationType.id,
      name: celebrationType.name,
      description: celebrationType.description,
      created_at: celebrationType.created_at,
    };
  }

  private mapMassCalendarToResponse(mass: MassCalendar): MassCalendarResponseDto {
    return {
      id: mass.id,
      celebration_type: {
        id: mass.celebration_type.id,
        name: mass.celebration_type.name,
      },
      mass_date: mass.mass_date,
      start_time: mass.start_time,
      end_time: mass.end_time,
      location: mass.location,
      status: mass.status as MassStatus,
      notes: mass.notes,
      created_by_user_id: mass.created_by_user_id,
      created_at: mass.created_at,
      updated_at: mass.updated_at,
    };
  }
}
