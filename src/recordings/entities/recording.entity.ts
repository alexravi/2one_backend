import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';

export enum ValidationStatus {
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('recordings')
export class Recording {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  @ManyToOne(() => User, (user) => user.recordings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  file_name: string;

  @Column()
  blob_url: string;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ type: 'int', nullable: true })
  sample_rate: number;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'int', nullable: true })
  speaker_count: number;

  @CreateDateColumn()
  upload_date: Date;

  @Column({
    type: 'enum',
    enum: ValidationStatus,
    default: ValidationStatus.PROCESSING,
  })
  validation_status: ValidationStatus;

  @Column({ default: 'pending' })
  payment_status: string;
}
