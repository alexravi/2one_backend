import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording, ValidationStatus } from '../recordings/entities/recording.entity';
import type { Response } from 'express';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectRepository(Recording)
    private recordingsRepository: Repository<Recording>,
  ) {}

  async exportDatasetCsv(res: Response) {
    const recordings = await this.recordingsRepository.find({
      where: { validation_status: ValidationStatus.APPROVED },
      order: { upload_date: 'DESC' },
    });

    const csvHeader = 'file_name,duration,language,speaker_count,blob_url\n';
    const csvRows = recordings.map(rec => 
      `"${rec.file_name}",${rec.duration || ''},"${rec.language || ''}",${rec.speaker_count || ''},"${rec.blob_url}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dataset.csv');
    res.send(csvContent);
  }
}
