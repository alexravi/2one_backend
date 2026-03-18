import { Controller, Post, UseGuards, Req, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AzureBlobService } from '../shared/azure/azure-blob.service';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private azureBlobService: AzureBlobService) {}

  @Post('presigned-url')
  @ApiOperation({
    summary: 'Generate a presigned upload URL',
    description: 'Returns a signed Azure Blob Storage URL for the client to upload audio directly. Supported formats: WAV, MP3, M4A.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'call_recording.wav', description: 'Original filename with extension' },
      },
      required: ['filename'],
    },
  })
  @ApiResponse({ status: 201, description: 'Returns upload_url and file_id.', schema: {
    type: 'object',
    properties: {
      upload_url: { type: 'string', description: 'Signed Azure Blob Storage URL for direct upload' },
      file_id: { type: 'string', description: 'Unique file identifier to use when registering the recording' },
    },
  }})
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT.' })
  @ApiResponse({ status: 503, description: 'Azure Blob Storage not configured.' })
  async getPresignedUrl(@Body('filename') originalFilename: string, @Req() req: any) {
    if (!this.azureBlobService.isConfigured) {
      throw new HttpException(
        'Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING in your .env file.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!originalFilename) {
      throw new HttpException('filename is required in request body.', HttpStatus.BAD_REQUEST);
    }

    const userId = req.user.id;
    const fileExtension = originalFilename.split('.').pop();
    const uniqueFilename = `${userId}/${uuidv4()}.${fileExtension}`;

    try {
      const uploadUrl = await this.azureBlobService.generatePresignedUrl(uniqueFilename);

      return {
        upload_url: uploadUrl,
        file_id: uniqueFilename,
      };
    } catch (err: any) {
      throw new HttpException(
        `Failed to generate upload URL: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
