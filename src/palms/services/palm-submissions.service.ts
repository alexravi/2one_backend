import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AzureBlobService } from '../../shared/azure/azure-blob.service';
import { PalmPhoto, PalmPhotoSlot } from '../entities/palm-photo.entity';
import { PalmSubmission, PalmValidationStatus } from '../entities/palm-submission.entity';
import { RegisterPalmSubmissionDto } from '../dto/register-palm-submission.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PalmSubmissionsService {
  private readonly expectedSlots: PalmPhotoSlot[] = [
    PalmPhotoSlot.RIGHT_BACK_BG1,
    PalmPhotoSlot.RIGHT_BACK_BG2,
    PalmPhotoSlot.RIGHT_BACK_BG3,
    PalmPhotoSlot.RIGHT_FRONT_BG1,
    PalmPhotoSlot.RIGHT_FRONT_BG2,
    PalmPhotoSlot.RIGHT_FRONT_BG3,
    PalmPhotoSlot.LEFT_BACK_BG1,
    PalmPhotoSlot.LEFT_BACK_BG2,
    PalmPhotoSlot.LEFT_BACK_BG3,
    PalmPhotoSlot.LEFT_FRONT_BG1,
    PalmPhotoSlot.LEFT_FRONT_BG2,
    PalmPhotoSlot.LEFT_FRONT_BG3,
  ];

  constructor(
    @InjectRepository(PalmSubmission)
    private readonly submissionsRepository: Repository<PalmSubmission>,
    @InjectRepository(PalmPhoto)
    private readonly photosRepository: Repository<PalmPhoto>,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  async createSubmission(userId: string, dto: RegisterPalmSubmissionDto): Promise<PalmSubmission> {
    const existing = await this.submissionsRepository.findOne({
      where: { user: { id: userId } },
    });

    // Spec: accept only 1 set from a person.
    if (existing) {
      throw new BadRequestException('You have already submitted a palm set.');
    }

    if (dto.photos.length !== this.expectedSlots.length) {
      throw new BadRequestException(`Exactly ${this.expectedSlots.length} photos are required.`);
    }

    const slotSet = new Set(dto.photos.map((p) => p.slot));
    if (slotSet.size !== dto.photos.length) {
      throw new BadRequestException('Duplicate slots are not allowed.');
    }

    for (const expectedSlot of this.expectedSlots) {
      if (!slotSet.has(expectedSlot)) {
        throw new BadRequestException(`Missing required slot: ${expectedSlot}`);
      }
    }

    const submission = this.submissionsRepository.create({
      user: { id: userId } as User,
      age: dto.age,
      gender: dto.gender,
      ethnos: dto.ethnos,
      profession: dto.profession,
      smartphone_model: dto.smartphone_model,
      dominant_hand: dto.dominant_hand,
      validation_status: PalmValidationStatus.PENDING_REVIEW,
      payment_status: 'pending',
      photos: [],
    });

    submission.photos = dto.photos.map((photoInput) => {
      const blobUrl = this.azureBlobService.getBlobUrl(photoInput.file_id);
      return this.photosRepository.create({
        slot: photoInput.slot,
        file_name: photoInput.filename,
        blob_path: photoInput.file_id,
        blob_url: blobUrl,
        size_bytes: photoInput.size,
        client_meta: photoInput.client_meta,
        submission,
      });
    });

    const saved = await this.submissionsRepository.save(submission);
    return this.findByIdForOwner(saved.id, userId);
  }

  async findByUser(userId: string): Promise<PalmSubmission[]> {
    return this.submissionsRepository.find({
      where: { user: { id: userId } },
      relations: ['photos'],
      order: { upload_date: 'DESC' },
    });
  }

  async findByIdForOwner(id: string, userId: string): Promise<PalmSubmission> {
    const submission = await this.submissionsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['photos'],
    });

    if (!submission) {
      throw new NotFoundException('Palm submission not found');
    }
    return submission;
  }

  // Used by admin endpoints (no owner restriction).
  async findById(id: string): Promise<PalmSubmission> {
    const submission = await this.submissionsRepository.findOne({
      where: { id },
      relations: ['photos', 'user'],
    });

    if (!submission) {
      throw new NotFoundException('Palm submission not found');
    }
    return submission;
  }
}

