import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('offering_types')
export class OfferingType {
  @ApiProperty({
    description: 'Identifiant unique du type d\'offrande',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nom du type d\'offrande',
    example: 'Dîme',
    maxLength: 255,
  })
  @Column({ unique: true, length: 255 })
  name: string;

  @ApiProperty({
    description: 'Description détaillée du type d\'offrande',
    example: 'Contribution mensuelle représentant 10% des revenus',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Statut actif/inactif du type d\'offrande',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({
    description: 'Date de création du type d\'offrande',
    example: '2025-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-01-20T14:45:00Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
