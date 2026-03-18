import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayoutRequest, PayoutStatus } from './entities/payout-request.entity';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { WalletsService } from '../wallets/wallets.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(PayoutRequest)
    private payoutsRepository: Repository<PayoutRequest>,
    private walletsService: WalletsService,
  ) {}

  async requestPayout(userId: string, dto: RequestPayoutDto): Promise<PayoutRequest> {
    const currentBalance = await this.walletsService.getBalance(userId);
    
    if (currentBalance < dto.amount) {
      throw new BadRequestException('Insufficient balance for this payout request');
    }

    // Deduct from wallet immediately to prevent double spending
    await this.walletsService.debit(userId, dto.amount);

    const payoutRequest = this.payoutsRepository.create({
      user: { id: userId } as User,
      amount: dto.amount,
      bank_account_name: dto.bank_account_name,
      account_number: dto.account_number,
      ifsc_code: dto.ifsc_code,
      status: PayoutStatus.PENDING,
    });

    return this.payoutsRepository.save(payoutRequest);
  }

  async getUserPayouts(userId: string): Promise<PayoutRequest[]> {
    return this.payoutsRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }
}
