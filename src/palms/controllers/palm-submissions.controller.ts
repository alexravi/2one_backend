import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { PalmSubmissionsService } from '../services/palm-submissions.service';
import { RegisterPalmSubmissionDto } from '../dto/register-palm-submission.dto';

@ApiTags('Palm Submissions')
@ApiBearerAuth('JWT-auth')
@Controller('palm-submissions')
@UseGuards(JwtAuthGuard)
export class PalmSubmissionsController {
  constructor(private readonly palmSubmissionsService: PalmSubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a full palm set (12 photos)' })
  @ApiResponse({ status: 201, description: 'Palm submission created.' })
  async create(@Body() dto: RegisterPalmSubmissionDto, @Req() req: any) {
    const userId = req.user.id;
    return this.palmSubmissionsService.createSubmission(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my palm submissions' })
  @ApiResponse({ status: 200, description: 'List of palm submissions.' })
  async findMy(@Req() req: any) {
    const userId = req.user.id;
    return this.palmSubmissionsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a palm submission by id' })
  @ApiResponse({ status: 200, description: 'Palm submission found.' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.palmSubmissionsService.findByIdForOwner(id, userId);
  }
}

