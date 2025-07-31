import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MassRequest } from './mass-request.entity';

@Entity('mass_request_details')
export class MassRequestDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MassRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mass_request_id' })
  mass_request: MassRequest;

  @Column({ length: 100 })
  detail_type: string;

  @Column('text')
  value: string;
}
