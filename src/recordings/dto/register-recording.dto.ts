import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRecordingDto {
  @ApiProperty({ example: 'user-uuid/file-uuid.wav', description: 'Unique file identifier returned by the presigned-url endpoint' })
  @IsString()
  @IsNotEmpty()
  file_id: string;

  @ApiProperty({ example: 'call_recording.wav', description: 'Original filename' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 1048576, description: 'File size in bytes' })
  @IsNumber()
  size: number;
}
