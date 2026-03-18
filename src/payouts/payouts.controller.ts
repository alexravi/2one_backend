import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { WalletsService } from '../wallets/wallets.service';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Payouts')
@ApiBearerAuth('JWT-auth')
@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(
    private readonly payoutsService: PayoutsService,
    private readonly walletsService: WalletsService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance', description: 'Returns the current wallet balance for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Returns { balance: number }.' })
  async getBalance(@Req() req: any) {
    const userId = req.user.id;
    const balance = await this.walletsService.getBalance(userId);
    return { balance };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history', description: 'Returns all wallet transactions for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'List of transactions.' })
  async getTransactions(@Req() req: any) {
    const userId = req.user.id;
    return this.walletsService.getTransactions(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payout request history', description: 'Returns all payout requests made by the authenticated user.' })
  @ApiResponse({ status: 200, description: 'List of payout requests.' })
  async getPayoutHistory(@Req() req: any) {
    const userId = req.user.id;
    return this.payoutsService.getUserPayouts(userId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request a payout', description: 'Submits a withdrawal request. Minimum payout is $5. Balance is deducted immediately.' })
  @ApiResponse({ status: 201, description: 'Payout request created successfully.' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or validation error.' })
  async requestPayout(@Body() dto: RequestPayoutDto, @Req() req: any) {
    const userId = req.user.id;
    return this.payoutsService.requestPayout(userId, dto);
  }
}
