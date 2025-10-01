import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserHasRole } from '../../roles/entities/user-has-role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  GUEST = 'guest',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: 'uuid-string',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: "Email de l'utilisateur (unique)",
    example: 'user@digifaz.com',
  })
  @Column({ length: 150, unique: true })
  email: string;

  @ApiProperty({
    description: 'Mot de passe hashé',
    writeOnly: true,
  })
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'Jean Dupont',
  })
  @Column({ length: 200 })
  fullName: string;

  @ApiProperty({
    description: 'Numéro de téléphone (optionnel)',
    example: '+237690123456',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'Rôles assignés à l\'utilisateur',
    type: () => [UserHasRole],
  })
  @OneToMany(() => UserHasRole, userHasRole => userHasRole.user)
  userRoles: UserHasRole[];

  @ApiProperty({
    description: 'Statut du compte utilisateur',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.GUEST,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
