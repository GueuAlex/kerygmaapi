import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 6 })
  otp: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken: string;

  @Column({ type: 'timestamp' })
  otpExpiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
