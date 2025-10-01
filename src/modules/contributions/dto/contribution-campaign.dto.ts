import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum CampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
}

export enum TargetGroup {
  ALL = 'all',
  ADULTS = 'adults',
  YOUTH = 'youth',
  FAMILIES = 'families',
  SPECIFIC = 'specific',
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Nom unique de la campagne de cotisation',
    example: 'Construction Nouvelle Église 2025',
    maxLength: 255,
    minLength: 3,
    pattern: '^[a-zA-ZÀ-ÿ0-9\\s\\-_]+$',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: `
    Description détaillée expliquant l'objectif et les modalités de la campagne.
    
    **Utilisation :**
    - Décrivez clairement l'objectif de la campagne
    - Mentionnez l'utilisation prévue des fonds
    - Ajoutez des détails motivants pour les contributeurs
    `,
    example: 'Campagne pour financer la construction de la nouvelle église paroissiale. Objectif : collecter 50 millions FCFA pour les matériaux et la main d\'œuvre. Démarrage prévu en juin 2025.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: `
    Date officielle de lancement de la campagne (format YYYY-MM-DD).
    
    **Important :**
    - Ne peut pas être antérieure à la date actuelle
    - Doit être antérieure à la date de fin si spécifiée
    - Utilisée pour l'activation automatique de la campagne
    `,
    example: '2025-01-01',
    format: 'date',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({
    description: `
    Date de clôture de la campagne (format YYYY-MM-DD).
    
    **Comportement :**
    - Si non spécifiée, la campagne reste ouverte indéfiniment
    - La campagne passe automatiquement en statut 'completed' à cette date
    - Les cartes restent actives mais plus de nouvelles cartes ne peuvent être créées
    `,
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: `
    **CONCEPT CLÉ** : Détermine le mode de contribution de votre campagne.
    
    ## 🔹 Mode MONTANT FIXE (is_fixed_amount = true)
    
    **Principe :** Tous les participants contribuent exactement le même montant.
    
    **Cas d'usage idéaux :**
    - 💰 Cotisations annuelles ou mensuelles
    - 🎫 Frais d'adhésion ou d'inscription
    - 📋 Contributions pour événements à coût fixe
    - ⚖️ Campagnes nécessitant l'équité entre membres
    
    **Avantages :**
    - Simplicité administrative
    - Égalité entre tous les contributeurs
    - Prévisibilité des revenus
    - Facilite la gestion comptable
    
    **Exemple :** Cotisation paroissiale 2025 = 25,000 FCFA par famille
    
    ## 🔹 Mode MONTANT VARIABLE (is_fixed_amount = false)
    
    **Principe :** Chaque participant choisit librement son montant de contribution.
    
    **Cas d'usage idéaux :**
    - 🏗️ Construction d'infrastructures (église, école)
    - 🎯 Projets caritatifs ou sociaux
    - 💝 Collectes pour urgences ou besoins spéciaux
    - 🌟 Campagnes volontaires et motivationnelles
    
    **Avantages :**
    - Adaptation aux capacités financières
    - Potentiel de collecte plus important
    - Participation inclusive (petites et grosses contributions)
    - Flexibilité selon les circonstances
    
    **Exemple :** Construction nouvelle église - chacun donne selon ses moyens
    
    ## ⚠️ **RÈGLE IMPORTANTE**
    Si is_fixed_amount = true → Le champ fixed_amount devient OBLIGATOIRE
    `,
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_fixed_amount?: boolean;

  @ApiPropertyOptional({
    description: `
    **MONTANT FIXE OBLIGATOIRE** : Le montant exacte que chaque participant doit contribuer.
    
    ## 💰 **Quand l'utiliser ?**
    
    **OBLIGATOIRE** quand is_fixed_amount = true
    **IGNORÉ** quand is_fixed_amount = false
    
    ## 📋 **Exemples concrets :**
    
    **Cotisation annuelle :** 25,000 FCFA par membre adulte
    - Tous les adultes de la paroisse payent exactement 25,000 FCFA
    - Aucune variation possible
    - Facilite la budgétisation : 500 membres × 25,000 = 12,500,000 FCFA
    
    **Frais d'inscription événement :** 15,000 FCFA par famille
    - Chaque famille inscrite paye 15,000 FCFA
    - Couvre les frais exacts de l'événement
    - Égalité de traitement
    
    **Projet spécifique :** 100,000 FCFA par contributeur
    - Campagne pour équipement liturgique précis
    - Montant calculé selon le coût total ÷ nombre de participants
    
    ## ⚡ **Impact sur les cartes de contribution :**
    
    Quand fixed_amount est défini :
    - Toutes les cartes créées auront ce montant en "initial_amount"
    - Les utilisateurs ne peuvent PAS modifier le montant
    - Le système valide automatiquement les paiements à ce montant exact
    - Les rapports sont simplifiés (participation = oui/non)
    
    ## 💡 **Calculs automatiques possibles :**
    
    - **Revenus prévisionnels** = fixed_amount × target_participant_count
    - **Taux de participation** = cartes_créées ÷ target_participant_count
    - **Revenus actuels** = fixed_amount × cartes_payées
    
    ## ⚠️ **Limites et validations :**
    
    - **Minimum** : 100 FCFA (éviter montants ridicules)
    - **Maximum** : 10,000,000 FCFA (contributions raisonnables)
    - **Cohérence** : Doit être ≥ minimum_individual_amount si défini
    `,
    example: 25000,
    minimum: 100,
    maximum: 10000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  fixed_amount?: number;

  @ApiPropertyOptional({
    description: `
    Groupe cible pour cette campagne de cotisation.
    
    **Options disponibles :**
    - **all** : Tous les paroissiens (par défaut)
    - **adults** : Adultes uniquement (18+ ans)
    - **youth** : Jeunes et adolescents
    - **families** : Familles constituées
    - **specific** : Groupe spécifique (nécessite définition manuelle)
    
    **Utilisation :**
    - Permet de cibler précisément les participants
    - Facilite la communication et le suivi
    - Aide au calcul des objectifs selon le groupe
    `,
    enum: TargetGroup,
    example: TargetGroup.ALL,
    default: TargetGroup.ALL,
  })
  @IsOptional()
  @IsEnum(TargetGroup)
  target_group?: TargetGroup;

  @ApiPropertyOptional({
    description: `
    Nombre cible de participants pour cette campagne.
    
    **Objectif :**
    - Définit combien de personnes devraient participer
    - Aide au calcul du pourcentage de participation
    - Utile pour l'analyse de performance
    
    **Calculs automatiques :**
    - Taux de participation = participants actuels / target_participant_count
    - Estimation des revenus si combiné avec fixed_amount
    `,
    example: 250,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  target_participant_count?: number;

  @ApiPropertyOptional({
    description: `
    Objectif financier total de la campagne en FCFA.
    
    **Purpose :**
    - Montant total que la campagne vise à collecter
    - Permet le suivi du pourcentage d'atteinte
    - Sert de référence pour les rapports
    
    **Calculs automatiques :**
    - Pourcentage atteint = montant collecté / target_amount
    - Montant restant = target_amount - montant collecté
    
    **Note :** Peut être différent de (fixed_amount × target_participant_count)
    `,
    example: 5000000,
    minimum: 1000,
    maximum: 1000000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  target_amount?: number;

  @ApiPropertyOptional({
    description: `
    Montant minimum qu'un participant peut contribuer en FCFA.
    
    **Utilisation :**
    - Applicable uniquement si is_fixed_amount = false
    - Évite les contributions trop faibles
    - Simplifie la gestion administrative
    
    **Validation :**
    - Doit être < fixed_amount si fixed_amount est défini
    - Ignoré si is_fixed_amount = true
    
    **Exemple :** Pour éviter les contributions de 100 FCFA difficiles à gérer
    `,
    example: 5000,
    minimum: 100,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minimum_individual_amount?: number;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({
    description: 'Nom de la campagne',
    example: 'Construction Nouvelle Eglise 2025 - Modifie',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description de la campagne',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Date de fin de la campagne',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: `
    **Montant fixe obligatoire** en FCFA pour cette campagne.
    
    **Utilisation :**
    - Définit le montant exact que chaque participant doit payer
    - Actif uniquement si la campagne est en mode montant fixe
    - Remplace la valeur précédente si modifiée
    
    **Note :** Modifier ce champ affecte toutes les nouvelles cartes créées après la modification.
    `,
    example: 30000,
    minimum: 100,
    maximum: 10000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  fixed_amount?: number;

  @ApiPropertyOptional({
    description: 'Groupe cible de la campagne',
    enum: TargetGroup,
    example: TargetGroup.ALL,
  })
  @IsOptional()
  @IsEnum(TargetGroup)
  target_group?: TargetGroup;

  @ApiPropertyOptional({
    description: 'Nombre cible de participants',
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  target_participant_count?: number;

  @ApiPropertyOptional({
    description: 'Objectif financier en FCFA',
    minimum: 1000,
    maximum: 1000000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  target_amount?: number;

  @ApiPropertyOptional({
    description: 'Montant minimum individuel en FCFA',
    minimum: 100,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minimum_individual_amount?: number;
}

export class CampaignResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la campagne',
    example: 1,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Nom unique de la campagne de cotisation',
    example: 'Construction Nouvelle Église 2025',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    description: 'Description détaillée de la campagne avec objectifs et modalités',
    example: 'Campagne pour financer la construction de la nouvelle église paroissiale. Objectif : collecter 50 millions FCFA pour les matériaux et la main d\'œuvre.',
    nullable: true,
    maxLength: 1000,
  })
  description: string | null;

  @ApiProperty({
    description: 'Date de debut',
    example: '2025-01-01',
  })
  start_date: string;

  @ApiProperty({
    description: 'Date de fin',
    example: '2025-12-31',
    nullable: true,
  })
  end_date: string | null;

  @ApiProperty({
    description: `
    **Mode de contribution de cette campagne.**
    
    - **true** = Montant fixe (tous les participants payent le même montant)
    - **false** = Montant variable (chacun choisit son montant)
    
    **Impact :** Détermine si fixed_amount est utilisé ou ignoré.
    `,
    example: false,
  })
  is_fixed_amount: boolean;

  @ApiProperty({
    description: `
    **Montant obligatoire par participant** (en FCFA) si is_fixed_amount = true.
    
    **Utilisation :**
    - Actif seulement si is_fixed_amount = true
    - Null si is_fixed_amount = false
    - Détermine le montant exact de chaque contribution
    
    **Exemples :**
    - Cotisation annuelle : 25,000 FCFA
    - Frais d'événement : 15,000 FCFA
    - Contribution projet : 100,000 FCFA
    `,
    example: 25000,
    nullable: true,
  })
  fixed_amount: number | null;

  @ApiProperty({
    description: `
    Groupe cible de cette campagne.
    
    **Types disponibles :**
    - **all** : Tous les paroissiens
    - **adults** : Adultes uniquement (18+ ans)
    - **youth** : Jeunes et adolescents
    - **families** : Familles constituees
    - **specific** : Groupe specifique defini manuellement
    `,
    enum: TargetGroup,
    example: TargetGroup.ALL,
  })
  target_group: TargetGroup;

  @ApiProperty({
    description: `
    Nombre cible de participants pour cette campagne.
    
    **Utilisation :**
    - Permet de calculer le taux de participation
    - Aide a estimer les revenus previsionnels
    - Facilite le suivi des objectifs
    `,
    example: 250,
    nullable: true,
  })
  target_participant_count: number | null;

  @ApiProperty({
    description: `
    Objectif financier total en FCFA.
    
    **Metriques calculees :**
    - Pourcentage d'atteinte = total_collected / target_amount
    - Montant restant = target_amount - total_collected
    `,
    example: 5000000,
    nullable: true,
  })
  target_amount: number | null;

  @ApiProperty({
    description: `
    Montant minimum individuel autorise en FCFA.
    
    **Application :**
    - Actif uniquement pour les campagnes a montant variable
    - Ignore si is_fixed_amount = true
    - Evite les micro-contributions difficiles a gerer
    `,
    example: 5000,
    nullable: true,
  })
  minimum_individual_amount: number | null;

  @ApiProperty({
    description: 'Statut de la campagne',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;

  @ApiProperty({
    description: `
    Nombre total de cartes créées pour cette campagne.
    
    **Inclut :**
    - Cartes virtuelles et physiques
    - Cartes actives, inactives et complétées
    - Cartes liées à des utilisateurs ou anonymes
    `,
    example: 150,
    minimum: 0,
  })
  total_cards: number;

  @ApiProperty({
    description: `
    Montant total collecté en FCFA pour cette campagne.
    
    **Calcul :**
    - Somme de toutes les contributions validées
    - Inclut les paiements en ligne et en espèces
    - Mis à jour en temps réel
    `,
    example: 2500000,
    minimum: 0,
  })
  total_collected: number;

  @ApiProperty({
    description: 'Date de creation',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date de derniere mise a jour',
  })
  updated_at: Date;
}

export class QueryCampaignsDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: CampaignStatus,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Date de debut minimum (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @ApiPropertyOptional({
    description: 'Date de debut maximum (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  start_date_to?: string;

  @ApiPropertyOptional({
    description: 'Page numero',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 1 : parsed;
  })
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'elements par page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 10;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 10 : parsed;
  })
  @IsNumber()
  @Min(1)
  limit?: number;
}