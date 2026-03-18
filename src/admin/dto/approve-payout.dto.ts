import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayoutStatus } from '../../payouts/entities/payout-request.entity';

export class ApprovePayoutDto {
  @ApiProperty({ example: 'uuid-of-payout-request', description: 'Payout request UUID' })
  @IsString()
  @IsNotEmpty()
  payout_id: string;

  @ApiProperty({ enum: PayoutStatus, example: PayoutStatus.APPROVED, description: 'New payout status' })
  @IsEnum(PayoutStatus)
  status: PayoutStatus;
}
