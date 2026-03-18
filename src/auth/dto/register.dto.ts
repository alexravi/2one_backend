import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', description: 'Password (minimum 6 characters)', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

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
}
