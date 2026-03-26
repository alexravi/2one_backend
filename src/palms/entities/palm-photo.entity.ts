import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert, CreateDateColumn, Index } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PalmSubmission } from './palm-submission.entity';

export enum PalmPhotoSlot {
  // Right palm (back)
  RIGHT_BACK_BG1 = 'RIGHT_BACK_BG1',
  RIGHT_BACK_BG2 = 'RIGHT_BACK_BG2',
  RIGHT_BACK_BG3 = 'RIGHT_BACK_BG3',

  // Right palm (front / selfie)
  RIGHT_FRONT_BG1 = 'RIGHT_FRONT_BG1',
  RIGHT_FRONT_BG2 = 'RIGHT_FRONT_BG2',
  RIGHT_FRONT_BG3 = 'RIGHT_FRONT_BG3',

  // Left palm (back)
  LEFT_BACK_BG1 = 'LEFT_BACK_BG1',
  LEFT_BACK_BG2 = 'LEFT_BACK_BG2',
  LEFT_BACK_BG3 = 'LEFT_BACK_BG3',

  // Left palm (front / selfie)
  LEFT_FRONT_BG1 = 'LEFT_FRONT_BG1',
  LEFT_FRONT_BG2 = 'LEFT_FRONT_BG2',
  LEFT_FRONT_BG3 = 'LEFT_FRONT_BG3',
}

@Entity('palm_photos')
@Index(['submission', 'slot'], { unique: true })
export class PalmPhoto {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  @ManyToOne(() => PalmSubmission, (submission) => submission.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: PalmSubmission;

  @Column({ type: 'enum', enum: PalmPhotoSlot })
  slot: PalmPhotoSlot;

  @Column()
  file_name: string;

  // For audit/debugging: matches the presigned upload "file_id".
  @Column()
  blob_path: string;

  @Column()
  blob_url: string;

  @Column({ type: 'bigint', nullable: true })
  size_bytes: number;

  @Column({ type: 'jsonb', nullable: true })
  client_meta: any;

  @CreateDateColumn()
  created_at: Date;
}

