import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PalmValidationStatus } from '../../palms/entities/palm-submission.entity';

export class ReviewPalmSubmissionDto {
  @ApiProperty({ example: 'uuid-of-palm-submission', description: 'Palm submission UUID to review' })
  @IsString()
  @IsNotEmpty()
  submission_id: string;

  @ApiProperty({ enum: PalmValidationStatus, example: PalmValidationStatus.APPROVED, description: 'New validation status' })
  @IsEnum(PalmValidationStatus)
  status: PalmValidationStatus;

  @ApiPropertyOptional({ example: 'Back camera lighting too strong; palm not parallel.', description: 'Reason for rejection (optional)' })
  @IsOptional()
  @IsString()
  rejection_reason?: string;
}

