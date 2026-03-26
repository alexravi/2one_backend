import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { PalmPhoto } from './palm-photo.entity';

export enum PalmValidationStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('palm_submissions')
export class PalmSubmission {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  @ManyToOne(() => User, (user) => user.palm_submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  age: number;

  @Column()
  gender: string;

  // Participant-selected ethnicity bucket (used for quotas during recruiting)
  @Column()
  ethnos: string;

  @Column()
  profession: string;

  @Column()
  smartphone_model: string;

  @Column()
  dominant_hand: string;

  @CreateDateColumn()
  upload_date: Date;

  @Column({
    type: 'enum',
    enum: PalmValidationStatus,
    default: PalmValidationStatus.PENDING_REVIEW,
  })
  validation_status: PalmValidationStatus;

  @Column({ default: 'pending' })
  payment_status: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string | null;

  @OneToMany(() => PalmPhoto, (photo) => photo.submission, { cascade: true })
  photos: PalmPhoto[];
}

