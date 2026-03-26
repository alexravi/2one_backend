import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PalmPhotoSlot } from '../entities/palm-photo.entity';

export enum DominantHand {
  RIGHT = 'right',
  LEFT = 'left',
}

export enum EthnosBucket {
  EUROPEAN = 'european',
  AFRICAN = 'african',
  HINDI = 'hindi',
  ASIAN = 'asian',
  OTHER = 'other',
}

export class PalmPhotoInputDto {
  @ApiProperty({ example: 'user-uuid/photo-uuid.jpg', description: 'Unique file identifier returned by presigned upload URL' })
  @IsString()
  @IsNotEmpty()
  file_id: string;

  @ApiProperty({ example: 'right_back_1.jpg', description: 'Original filename' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 34567, description: 'Image file size in bytes' })
  @IsNumber()
  size: number;

  @ApiProperty({ enum: PalmPhotoSlot, example: PalmPhotoSlot.RIGHT_BACK_BG1 })
  @IsEnum(PalmPhotoSlot)
  slot: PalmPhotoSlot;

  @ApiPropertyOptional({
    description: 'Client-side metadata (e.g., dimensions, mime, optional EXIF subset)',
    example: { width: 1080, height: 1920, mime: 'image/jpeg' },
  })
  @IsOptional()
  @IsObject()
  client_meta?: Record<string, unknown>;
}

export class RegisterPalmSubmissionDto {
  @ApiProperty({ example: 24, description: 'Age (must be >= 18)' })
  @IsNumber()
  @Min(18)
  age: number;

  @ApiProperty({ example: 'female' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ enum: EthnosBucket, example: EthnosBucket.EUROPEAN })
  @IsEnum(EthnosBucket)
  ethnos: EthnosBucket;

  @ApiProperty({ example: 'teacher' })
  @IsString()
  @IsNotEmpty()
  profession: string;

  @ApiProperty({ example: 'iPhone 15 Pro' })
  @IsString()
  @IsNotEmpty()
  smartphone_model: string;

  @ApiProperty({ enum: DominantHand, example: DominantHand.RIGHT })
  @IsEnum(DominantHand)
  dominant_hand: DominantHand;

  @ApiProperty({ type: [PalmPhotoInputDto], description: 'Exactly 12 photos (both hands, front/back, 3 backgrounds each)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PalmPhotoInputDto)
  photos: PalmPhotoInputDto[];
}

