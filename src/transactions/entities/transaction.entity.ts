import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { Recording } from '../../recordings/entities/recording.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Recording, { nullable: true })
  @JoinColumn({ name: 'recording_id' })
  recording: Recording;

  // Palm project submissions are stored separately from audio recordings.
  // For palm approvals, this field is populated while `recording` remains null.
  @Column({ nullable: true })
  palm_submission_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'completed' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
