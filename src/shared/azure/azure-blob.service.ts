import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureBlobService {
  private blobServiceClient: any = null;
  private sharedKeyCredential: any = null;
  private useSasConnectionString = false;
  private containerName: string;
  private readonly logger = new Logger(AzureBlobService.name);

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    this.containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME', 'recordings');

    if (connectionString) {
      try {
        const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

        // Check if this is a key-based or SAS-based connection string
        const accountName = this.parseConnectionStringValue(connectionString, 'AccountName');
        const accountKey = this.parseConnectionStringValue(connectionString, 'AccountKey');

        if (accountName && accountKey) {
          // Key-based connection string — can generate SAS tokens on-the-fly
          this.sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
          this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
          this.logger.log(`Azure Blob Storage connected via Access Key (account: ${accountName})`);
        } else if (connectionString.includes('SharedAccessSignature=')) {
          // SAS-based connection string — upload via direct blob URL using the SAS
          this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
          this.useSasConnectionString = true;
          this.logger.log('Azure Blob Storage connected via SAS token');
        } else {
          this.logger.warn('Azure Blob Storage connection string format not recognized');
        }
      } catch (err: any) {
        this.logger.warn(`Azure Blob Storage init failed: ${err.message}`);
      }
    } else {
      this.logger.warn('AZURE_STORAGE_CONNECTION_STRING not set — blob uploads will be unavailable');
    }
  }

  private parseConnectionStringValue(connectionString: string, key: string): string | null {
    const regex = new RegExp(`${key}=([^;]+)`);
    const match = connectionString.match(regex);
    return match ? match[1] : null;
  }

  get isConfigured(): boolean {
    return !!this.blobServiceClient;
  }

  async generatePresignedUrl(fileName: string): Promise<string> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured.');
    }

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

    // Ensure the container exists
    try {
      await containerClient.createIfNotExists();
    } catch {
      // Ignore — might not have permissions, container may already exist
    }

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    if (this.useSasConnectionString) {
      // SAS-based: The blobServiceClient already has the SAS token embedded.
      // The blob URL from this client already includes the SAS query parameters.
      // We just return the blockBlobClient URL directly — it already has auth.
      return blockBlobClient.url;
    }

    // Key-based: Generate a new SAS token for this specific blob
    const {
      generateBlobSASQueryParameters,
      BlobSASPermissions,
    } = require('@azure/storage-blob');

    const startsOn = new Date();
    const expiresOn = new Date(startsOn.valueOf() + 3600 * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse('cw'),
        startsOn,
        expiresOn,
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blockBlobClient.url}?${sasToken}`;
  }

  getBlobUrl(fileName: string): string {
    if (!this.blobServiceClient) {
      return `local://${fileName}`;
    }
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(fileName);
    return blobClient.url;
  }
}
