import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationStatus } from '../../recordings/entities/recording.entity';

export class ReviewRecordingDto {
  @ApiProperty({ example: 'uuid-of-recording', description: 'Recording UUID to review' })
  @IsString()
  @IsNotEmpty()
  recording_id: string;

  @ApiProperty({ enum: ValidationStatus, example: ValidationStatus.APPROVED, description: 'New validation status' })
  @IsEnum(ValidationStatus)
  status: ValidationStatus;
}
