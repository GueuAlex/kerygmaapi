import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ParishesService } from './parishes.service';
import {
  CreateParishDto,
  UpdateParishDto,
  QueryParishesDto,
  ParishResponseDto,
  PaginatedParishesResponseDto,
} from './dto';

@ApiTags('Gestion des Paroisses')
@Controller('parishes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ParishesController {
  constructor(private readonly parishesService: ParishesService) {}

  @Post()
  @Roles('admin', 'priest')
  @ApiOperation({
    summary: 'Creer une nouvelle paroisse',
    description: 'Permet aux administrateurs et pretres de creer une nouvelle paroisse avec toutes ses informations',
  })
  @ApiBody({ type: CreateParishDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Paroisse creee avec succes',
    type: ParishResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permissions insuffisantes',
    schema: {
      example: {
        message: 'Acces refuse. Roles requis: admin, priest. Votre role actuel: user',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Une paroisse avec ce nom existe deja',
    schema: {
      example: {
        message: 'Une paroisse avec ce nom existe deja',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Donnees de creation invalides',
    schema: {
      example: {
        message: ['Le nom de la paroisse est obligatoire'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async create(
    @Body(ValidationPipe) createParishDto: CreateParishDto,
  ): Promise<ParishResponseDto> {
    return this.parishesService.create(createParishDto);
  }

  @Get()
  @Roles('admin', 'priest', 'parish_admin')
  @ApiOperation({
    summary: 'Lister toutes les paroisses',
    description: 'Recupere la liste paginee de toutes les paroisses avec possibilite de recherche et tri',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Numero de page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'elements par page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Terme de recherche', example: 'Saint-Pierre' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Champ de tri', example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Ordre de tri', example: 'ASC' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des paroisses recuperee avec succes',
    type: PaginatedParishesResponseDto,
  })
  async findAll(
    @Query(ValidationPipe) queryDto: QueryParishesDto,
  ): Promise<PaginatedParishesResponseDto> {
    return this.parishesService.findAll(queryDto);
  }

  @Get('search')
  @Roles('admin', 'priest', 'parish_admin', 'user')
  @ApiOperation({
    summary: 'Rechercher des paroisses',
    description: 'Recherche rapide de paroisses par nom, adresse ou email',
  })
  @ApiQuery({ name: 'term', description: 'Terme de recherche (min 2 caracteres)', example: 'Saint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resultats de recherche',
    type: [ParishResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Terme de recherche trop court',
    schema: {
      example: {
        message: 'Le terme de recherche doit contenir au moins 2 caracteres',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async search(@Query('term') term: string): Promise<ParishResponseDto[]> {
    return this.parishesService.search(term);
  }

  @Get('stats')
  @Roles('admin', 'priest')
  @ApiOperation({
    summary: 'Statistiques des paroisses',
    description: 'Recupere les statistiques globales des paroisses (total, avec infos bancaires, etc.)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques recuperees avec succes',
    schema: {
      example: {
        total: 25,
        withBankInfo: 20,
        withMobileMoney: 22,
        withEmail: 24,
        withPhone: 23,
      },
    },
  })
  async getStats(): Promise<{
    total: number;
    withBankInfo: number;
    withMobileMoney: number;
    withEmail: number;
    withPhone: number;
  }> {
    return this.parishesService.getStats();
  }

  @Get(':id')
  @Roles('admin', 'priest', 'parish_admin', 'user')
  @ApiOperation({
    summary: 'Recuperer une paroisse par son ID',
    description: 'Recupere les details complets d\'une paroisse specifique',
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique de la paroisse', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paroisse trouvee',
    type: ParishResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paroisse non trouvee',
    schema: {
      example: {
        message: 'Paroisse avec l\'ID 550e8400-e29b-41d4-a716-446655440000 non trouvee',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ParishResponseDto> {
    return this.parishesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'priest')
  @ApiOperation({
    summary: 'Mettre a jour une paroisse',
    description: 'Met a jour partiellement les informations d\'une paroisse existante',
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique de la paroisse', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateParishDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paroisse mise a jour avec succes',
    type: ParishResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paroisse non trouvee',
    schema: {
      example: {
        message: 'Paroisse avec l\'ID 550e8400-e29b-41d4-a716-446655440000 non trouvee',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflit avec le nom de paroisse',
    schema: {
      example: {
        message: 'Une paroisse avec ce nom existe deja',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateParishDto: UpdateParishDto,
  ): Promise<ParishResponseDto> {
    return this.parishesService.update(id, updateParishDto);
  }

  @Put(':id/bank-info')
  @Roles('admin', 'priest')
  @ApiOperation({
    summary: 'Mettre a jour les informations bancaires',
    description: 'Met a jour specifiquement les informations bancaires d\'une paroisse',
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique de la paroisse', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({
    schema: {
      example: {
        bank_name: 'BACI',
        account_number: '12345678901234567890',
        iban: 'CI93CI0240151200000012345',
        bic: 'BACICIAB',
        account_holder: 'Paroisse Saint-Pierre',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Informations bancaires mises a jour avec succes',
    type: ParishResponseDto,
  })
  async updateBankInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bankInfo: {
      bank_name?: string;
      account_number?: string;
      iban?: string;
      bic?: string;
      account_holder?: string;
      [key: string]: any;
    },
  ): Promise<ParishResponseDto> {
    return this.parishesService.updateBankInfo(id, bankInfo);
  }

  @Put(':id/mobile-money')
  @Roles('admin', 'priest')
  @ApiOperation({
    summary: 'Mettre a jour les numeros mobile money',
    description: 'Met a jour specifiquement les numeros de mobile money d\'une paroisse',
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique de la paroisse', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({
    schema: {
      example: {
        orange_money: '07 12 34 56 78',
        mtn_money: '05 87 65 43 21',
        wave: '01 23 45 67 89',
        moov_money: '01 45 67 89 12',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Numeros mobile money mis a jour avec succes',
    type: ParishResponseDto,
  })
  async updateMobileMoneyNumbers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() mobileMoneyNumbers: {
      orange_money?: string;
      mtn_money?: string;
      wave?: string;
      moov_money?: string;
      [key: string]: any;
    },
  ): Promise<ParishResponseDto> {
    return this.parishesService.updateMobileMoneyNumbers(id, mobileMoneyNumbers);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Supprimer une paroisse',
    description: 'Supprime definitivement une paroisse (reserve aux administrateurs)',
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique de la paroisse', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paroisse supprimee avec succes',
    schema: {
      example: {
        message: 'Paroisse "Saint-Pierre de Yamoussoukro" supprimee avec succes',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paroisse non trouvee',
    schema: {
      example: {
        message: 'Paroisse avec l\'ID 550e8400-e29b-41d4-a716-446655440000 non trouvee',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.parishesService.remove(id);
  }
}