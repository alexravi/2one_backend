import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Recording } from '../recordings/entities/recording.entity';
import { PayoutRequest } from '../payouts/entities/payout-request.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { PalmSubmission } from '../palms/entities/palm-submission.entity';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Recording, PayoutRequest, Transaction, PalmSubmission]),
    WalletsModule,
  ],
  providers: [AdminService, AdminGuard],
  controllers: [AdminController],
})
export class AdminModule {}
