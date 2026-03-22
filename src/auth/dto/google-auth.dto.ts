import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'The Google ID token received from the frontend' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
