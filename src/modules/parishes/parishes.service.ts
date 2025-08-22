import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, IsNull } from 'typeorm';
import { Parish } from './entities/parish.entity';
import {
  CreateParishDto,
  UpdateParishDto,
  QueryParishesDto,
  ParishResponseDto,
  PaginatedParishesResponseDto,
} from './dto';

@Injectable()
export class ParishesService {
  constructor(
    @InjectRepository(Parish)
    private readonly parishRepository: Repository<Parish>,
  ) {}

  /**
   * Creer une nouvelle paroisse
   */
  async create(createParishDto: CreateParishDto): Promise<ParishResponseDto> {
    // Verifier si une paroisse avec ce nom existe deja
    const existingParish = await this.parishRepository.findOne({
      where: { name: createParishDto.name },
    });

    if (existingParish) {
      throw new ConflictException('Une paroisse avec ce nom existe deja');
    }

    const parish = this.parishRepository.create(createParishDto);
    const savedParish = await this.parishRepository.save(parish);

    return ParishResponseDto.fromEntity(savedParish);
  }

  /**
   * Recuperer toutes les paroisses avec pagination
   */
  async findAll(
    queryDto: QueryParishesDto,
  ): Promise<PaginatedParishesResponseDto> {
    const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.parishRepository.createQueryBuilder('parish');

    // Recherche par nom ou adresse
    if (search) {
      queryBuilder.where(
        '(parish.name LIKE :search OR parish.address LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Tri
    queryBuilder.orderBy(`parish.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [parishes, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: parishes.map(ParishResponseDto.fromEntity),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Recuperer une paroisse par son ID
   */
  async findOne(id: string): Promise<ParishResponseDto> {
    const parish = await this.parishRepository.findOne({
      where: { id },
    });

    if (!parish) {
      throw new NotFoundException(`Paroisse avec l'ID ${id} non trouvee`);
    }

    return ParishResponseDto.fromEntity(parish);
  }

  /**
   * Recuperer une paroisse par son nom
   */
  async findByName(name: string): Promise<ParishResponseDto | null> {
    const parish = await this.parishRepository.findOne({
      where: { name },
    });

    return parish ? ParishResponseDto.fromEntity(parish) : null;
  }

  /**
   * Mettre a jour une paroisse
   */
  async update(
    id: string,
    updateParishDto: UpdateParishDto,
  ): Promise<ParishResponseDto> {
    const parish = await this.parishRepository.findOne({
      where: { id },
    });

    if (!parish) {
      throw new NotFoundException(`Paroisse avec l'ID ${id} non trouvee`);
    }

    // Verifier l'unicite du nom si elle change
    if (updateParishDto.name && updateParishDto.name !== parish.name) {
      const existingParish = await this.parishRepository.findOne({
        where: { name: updateParishDto.name },
      });

      if (existingParish && existingParish.id !== id) {
        throw new ConflictException('Une paroisse avec ce nom existe deja');
      }
    }

    // Mettre a jour les champs
    Object.assign(parish, updateParishDto);
    const updatedParish = await this.parishRepository.save(parish);

    return ParishResponseDto.fromEntity(updatedParish);
  }

  /**
   * Supprimer une paroisse
   */
  async remove(id: string): Promise<{ message: string }> {
    const parish = await this.parishRepository.findOne({
      where: { id },
    });

    if (!parish) {
      throw new NotFoundException(`Paroisse avec l'ID ${id} non trouvee`);
    }

    await this.parishRepository.remove(parish);

    return {
      message: `Paroisse "${parish.name}" supprimee avec succes`,
    };
  }

  /**
   * Obtenir des statistiques sur les paroisses
   */
  async getStats(): Promise<{
    total: number;
    withBankInfo: number;
    withMobileMoney: number;
    withEmail: number;
    withPhone: number;
  }> {
    const [
      total,
      withBankInfo,
      withMobileMoney,
      withEmail,
      withPhone,
    ] = await Promise.all([
      this.parishRepository.count(),
      this.parishRepository.count({
        where: { bank_account_info: Not(IsNull()) },
      }),
      this.parishRepository.count({
        where: { mobile_money_numbers: Not(IsNull()) },
      }),
      this.parishRepository.count({
        where: { contact_email: Not(IsNull()) },
      }),
      this.parishRepository.count({
        where: { contact_phone: Not(IsNull()) },
      }),
    ]);

    return {
      total,
      withBankInfo,
      withMobileMoney,
      withEmail,
      withPhone,
    };
  }

  /**
   * Rechercher des paroisses par terme
   */
  async search(term: string): Promise<ParishResponseDto[]> {
    if (!term || term.trim().length < 2) {
      throw new BadRequestException(
        'Le terme de recherche doit contenir au moins 2 caracteres',
      );
    }

    const parishes = await this.parishRepository.find({
      where: [
        { name: Like(`%${term}%`) },
        { address: Like(`%${term}%`) },
        { contact_email: Like(`%${term}%`) },
      ],
      order: { name: 'ASC' },
      take: 20, // Limiter a 20 resultats
    });

    return parishes.map(ParishResponseDto.fromEntity);
  }

  /**
   * Verifier si une paroisse existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.parishRepository.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Mettre a jour les informations bancaires d'une paroisse
   */
  async updateBankInfo(
    id: string,
    bankInfo: {
      bank_name?: string;
      account_number?: string;
      iban?: string;
      bic?: string;
      account_holder?: string;
      [key: string]: any;
    },
  ): Promise<ParishResponseDto> {
    const parish = await this.parishRepository.findOne({
      where: { id },
    });

    if (!parish) {
      throw new NotFoundException(`Paroisse avec l'ID ${id} non trouvee`);
    }

    parish.bank_account_info = {
      ...parish.bank_account_info,
      ...bankInfo,
    };

    const updatedParish = await this.parishRepository.save(parish);
    return ParishResponseDto.fromEntity(updatedParish);
  }

  /**
   * Mettre a jour les numeros mobile money d'une paroisse
   */
  async updateMobileMoneyNumbers(
    id: string,
    mobileMoneyNumbers: {
      orange_money?: string;
      mtn_money?: string;
      wave?: string;
      moov_money?: string;
      [key: string]: any;
    },
  ): Promise<ParishResponseDto> {
    const parish = await this.parishRepository.findOne({
      where: { id },
    });

    if (!parish) {
      throw new NotFoundException(`Paroisse avec l'ID ${id} non trouvee`);
    }

    parish.mobile_money_numbers = {
      ...parish.mobile_money_numbers,
      ...mobileMoneyNumbers,
    };

    const updatedParish = await this.parishRepository.save(parish);
    return ParishResponseDto.fromEntity(updatedParish);
  }
}