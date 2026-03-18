import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { DatasetsService } from './datasets.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('Datasets')
@ApiBearerAuth('JWT-auth')
@Controller('datasets')
@UseGuards(JwtAuthGuard)
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Get('export')
  @ApiOperation({
    summary: 'Export approved recordings as CSV dataset',
    description: 'Generates and downloads a CSV file containing metadata of all approved recordings for client use.',
  })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'CSV file download containing file_name, duration, language, speaker_count, blob_url.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  exportDataset(@Res() res: Response) {
    return this.datasetsService.exportDatasetCsv(res);
  }
}
