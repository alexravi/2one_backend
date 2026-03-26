import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, OneToOne, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Recording } from '../../recordings/entities/recording.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { PayoutRequest } from '../../payouts/entities/payout-request.entity';
import { PalmSubmission } from '../../palms/entities/palm-submission.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv4();
  }

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  primary_language: string;

  @Column({ nullable: true })
  secondary_language: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  age_range: string;

  @Column({ nullable: true })
  gender: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Recording, (recording) => recording.user)
  recordings: Recording[];

  @OneToMany(() => PalmSubmission, (submission) => submission.user)
  palm_submissions: PalmSubmission[];

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => PayoutRequest, (payoutRequest) => payoutRequest.user)
  payout_requests: PayoutRequest[];
}
