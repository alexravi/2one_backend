import { Controller, Post, Get, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RecordingsService } from './recordings.service';
import { RegisterRecordingDto } from './dto/register-recording.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Recordings')
@ApiBearerAuth('JWT-auth')
@Controller('recordings')
@UseGuards(JwtAuthGuard)
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register an uploaded recording',
    description: 'Creates a recording entry in the database after the file has been uploaded to Azure Blob. Pushes a processing job to the queue.',
  })
  @ApiResponse({ status: 201, description: 'Recording registered and queued for processing.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  register(@Body() dto: RegisterRecordingDto, @Req() req: any) {
    const userId = req.user.id;
    return this.recordingsService.register(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my recordings', description: 'Returns all recordings belonging to the authenticated user.' })
  @ApiResponse({ status: 200, description: 'List of user recordings.' })
  findMyRecordings(@Req() req: any) {
    const userId = req.user.id;
    return this.recordingsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recording by ID', description: 'Returns a single recording by its UUID.' })
  @ApiParam({ name: 'id', description: 'Recording UUID' })
  @ApiResponse({ status: 200, description: 'Recording found.' })
  @ApiResponse({ status: 404, description: 'Recording not found.' })
  findOne(@Param('id') id: string) {
    return this.recordingsService.findById(id);
  }
}
