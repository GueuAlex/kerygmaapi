import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 150, nullable: true, unique: true })
  email: string;

  @Column({ length: 20, nullable: true, unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'guest'],
    default: 'guest',
  })
  status: 'active' | 'inactive' | 'suspended' | 'guest';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
