import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ReviewRecordingDto } from './dto/review-recording.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ValidationStatus } from '../recordings/entities/recording.entity';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users', description: 'Returns all registered users, ordered by creation date.' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('recordings')
  @ApiOperation({ summary: 'List all recordings', description: 'Returns all recordings, optionally filtered by validation status.' })
  @ApiQuery({ name: 'status', required: false, enum: ValidationStatus, description: 'Filter by validation status' })
  @ApiResponse({ status: 200, description: 'List of recordings with user info.' })
  getRecordings(@Query('status') status?: ValidationStatus) {
    return this.adminService.getAllRecordings(status);
  }

  @Post('recording/review')
  @ApiOperation({ summary: 'Review a recording', description: 'Approve or reject a recording. If approved, the user wallet is credited.' })
  @ApiResponse({ status: 201, description: 'Recording reviewed successfully.' })
  @ApiResponse({ status: 404, description: 'Recording not found.' })
  reviewRecording(@Body() dto: ReviewRecordingDto) {
    return this.adminService.reviewRecording(dto);
  }

  @Post('payout/approve')
  @ApiOperation({ summary: 'Approve or reject a payout request', description: 'Updates the payout request status. If rejected, the wallet is refunded.' })
  @ApiResponse({ status: 201, description: 'Payout request updated.' })
  @ApiResponse({ status: 404, description: 'Payout request not found.' })
  @ApiResponse({ status: 400, description: 'Request is no longer pending.' })
  approvePayout(@Body() dto: ApprovePayoutDto) {
    return this.adminService.approvePayout(dto);
  }
}
