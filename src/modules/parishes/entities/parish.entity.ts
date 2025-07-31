import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('parishes')
export class Parish {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 150, nullable: true })
  contact_email: string;

  @Column({ length: 20, nullable: true })
  contact_phone: string;

  @Column({ type: 'json', nullable: true })
  bank_account_info: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  mobile_money_numbers: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
