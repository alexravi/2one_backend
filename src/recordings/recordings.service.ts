import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording, ValidationStatus } from './entities/recording.entity';
import { RegisterRecordingDto } from './dto/register-recording.dto';
import { AzureServiceBusService } from '../shared/azure/azure-service-bus.service';
import { AzureBlobService } from '../shared/azure/azure-blob.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private recordingsRepository: Repository<Recording>,
    private serviceBusService: AzureServiceBusService,
    private blobService: AzureBlobService,
  ) {}

  async register(userId: string, dto: RegisterRecordingDto): Promise<Recording> {
    const blobUrl = this.blobService.getBlobUrl(dto.file_id);

    const recording = this.recordingsRepository.create({
      user: { id: userId } as User,
      file_name: dto.filename,
      blob_url: blobUrl,
      validation_status: ValidationStatus.PROCESSING,
    });

    const savedRecording = await this.recordingsRepository.save(recording);

    // Push job to queue
    await this.serviceBusService.sendRecordingJob(savedRecording.id, blobUrl);

    return savedRecording;
  }

  async findByUser(userId: string): Promise<Recording[]> {
    return this.recordingsRepository.find({
      where: { user: { id: userId } },
      order: { upload_date: 'DESC' },
    });
  }

  async findById(id: string): Promise<Recording> {
    const recording = await this.recordingsRepository.findOne({ where: { id } });
    if (!recording) {
      throw new NotFoundException('Recording not found');
    }
    return recording;
  }
}
