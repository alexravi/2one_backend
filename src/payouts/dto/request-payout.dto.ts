import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPayoutDto {
  @ApiProperty({ example: 50.00, description: 'Withdrawal amount (minimum $5)', minimum: 5 })
  @IsNumber()
  @Min(5.0)
  amount: number;

  @ApiProperty({ example: 'John Doe', description: 'Bank account holder name' })
  @IsString()
  @IsNotEmpty()
  bank_account_name: string;

  @ApiProperty({ example: '1234567890', description: 'Bank account number' })
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({ example: 'SBIN0001234', description: 'IFSC code for bank transfer' })
  @IsString()
  @IsNotEmpty()
  ifsc_code: string;
}
