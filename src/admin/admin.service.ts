import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording, ValidationStatus } from '../recordings/entities/recording.entity';
import { User } from '../users/entities/user.entity';
import { PayoutRequest, PayoutStatus } from '../payouts/entities/payout-request.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { ReviewRecordingDto } from './dto/review-recording.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { PalmSubmission, PalmValidationStatus } from '../palms/entities/palm-submission.entity';
import { ReviewPalmSubmissionDto } from './dto/review-palm-submission.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Recording)
    private readonly recordingsRepository: Repository<Recording>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PayoutRequest)
    private readonly payoutsRepository: Repository<PayoutRequest>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(PalmSubmission)
    private readonly palmSubmissionsRepository: Repository<PalmSubmission>,
    private readonly walletsService: WalletsService,
  ) {}

  async getAllUsers() {
    return this.usersRepository.find({ order: { created_at: 'DESC' } });
  }

  async getAllRecordings(status?: ValidationStatus) {
    const whereCondition = status ? { validation_status: status } : {};
    return this.recordingsRepository.find({
      where: whereCondition,
      relations: ['user'],
      order: { upload_date: 'DESC' },
    });
  }

  async reviewRecording(dto: ReviewRecordingDto) {
    const recording = await this.recordingsRepository.findOne({ 
      where: { id: dto.recording_id },
      relations: ['user']
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    // Example logic: credit $0.50 if approved and previous status was not APPROVED
    if (dto.status === ValidationStatus.APPROVED && recording.validation_status !== ValidationStatus.APPROVED) {
      const payoutRate = 0.50;
      
      // Update wallet balance
      // We should ideally use a Wallet entity directly to add instead of debit, but we need to add a credit function.
      // Let's implement it logically
      const walletBalance = await this.walletsService.getBalance(recording.user.id);
      await this.walletsService['walletsRepository'].update(
        { user: { id: recording.user.id } },
        { balance: Number(walletBalance) + payoutRate }
      );

      // Create a transaction record
      const transaction = this.transactionsRepository.create({
        user: { id: recording.user.id } as User,
        recording,
        amount: payoutRate,
        status: 'completed',
      });
      await this.transactionsRepository.save(transaction);
      
      recording.payment_status = 'paid';
    }

    recording.validation_status = dto.status;
    return this.recordingsRepository.save(recording);
  }

  async approvePayout(dto: ApprovePayoutDto) {
    const request = await this.payoutsRepository.findOne({
      where: { id: dto.payout_id },
      relations: ['user']
    });

    if (!request) {
      throw new NotFoundException('Payout request not found');
    }

    if (request.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Request is no longer pending');
    }

    if (dto.status === PayoutStatus.REJECTED) {
      // Refund wallet
      const walletBalance = await this.walletsService.getBalance(request.user.id);
      await this.walletsService['walletsRepository'].update(
        { user: { id: request.user.id } },
        { balance: Number(walletBalance) + Number(request.amount) }
      );
    }

    request.status = dto.status;
    return this.payoutsRepository.save(request);
  }

  async getAllPalmSubmissions(status?: PalmValidationStatus) {
    const whereCondition = status ? { validation_status: status } : {};
    return this.palmSubmissionsRepository.find({
      where: whereCondition,
      relations: ['user', 'photos'],
      order: { upload_date: 'DESC' },
    });
  }

  async getPalmSubmissionById(id: string) {
    const submission = await this.palmSubmissionsRepository.findOne({
      where: { id },
      relations: ['user', 'photos'],
    });

    if (!submission) {
      throw new NotFoundException('Palm submission not found');
    }

    return submission;
  }

  async reviewPalmSubmission(dto: ReviewPalmSubmissionDto) {
    const submission = await this.palmSubmissionsRepository.findOne({
      where: { id: dto.submission_id },
      relations: ['user'],
    });

    if (!submission) {
      throw new NotFoundException('Palm submission not found');
    }

    const payoutRate = Number(process.env.PALM_APPROVAL_PAYOUT ?? 1);

    if (dto.status === PalmValidationStatus.APPROVED && submission.validation_status !== PalmValidationStatus.APPROVED) {
      if (!Number.isFinite(payoutRate) || payoutRate <= 0) {
        throw new BadRequestException('Invalid PALM_APPROVAL_PAYOUT configuration');
      }

      await this.walletsService.credit(submission.user.id, payoutRate);

      const transaction = this.transactionsRepository.create({
        user: { id: submission.user.id } as User,
        amount: payoutRate,
        status: 'completed',
        recording: null as any,
        palm_submission_id: submission.id,
      });

      await this.transactionsRepository.save(transaction);
      submission.payment_status = 'paid';
      submission.rejection_reason = null;
    }

    if (dto.status === PalmValidationStatus.REJECTED) {
      submission.rejection_reason = dto.rejection_reason ?? submission.rejection_reason;
      submission.payment_status = 'pending';
    }

    submission.validation_status = dto.status;
    return this.palmSubmissionsRepository.save(submission);
  }
}
