import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'India', description: 'Country of residence' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'English', description: 'Primary spoken language' })
  @IsString()
  @IsOptional()
  primary_language?: string;

  @ApiPropertyOptional({ example: 'Hindi', description: 'Secondary spoken language' })
  @IsString()
  @IsOptional()
  secondary_language?: string;

  @ApiPropertyOptional({ example: '+1 555-123-4567', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '25-34', description: 'Age range' })
  @IsString()
  @IsOptional()
  age_range?: string;

  @ApiPropertyOptional({ example: 'male', description: 'Gender' })
  @IsString()
  @IsOptional()
  gender?: string;
}
