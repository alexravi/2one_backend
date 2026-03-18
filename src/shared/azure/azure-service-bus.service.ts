import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureServiceBusService implements OnModuleDestroy {
  private serviceBusClient: any = null;
  private sender: any = null;
  private readonly logger = new Logger(AzureServiceBusService.name);

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_SERVICE_BUS_CONNECTION_STRING');
    // Topic name — the SDK's createSender() works the same for both queues and topics
    const topicName = this.configService.get<string>('AZURE_SERVICE_BUS_TOPIC_NAME', 'processing-topic');

    if (connectionString) {
      try {
        const { ServiceBusClient } = require('@azure/service-bus');
        this.serviceBusClient = new ServiceBusClient(connectionString);
        this.sender = this.serviceBusClient.createSender(topicName);
        this.logger.log(`Azure Service Bus Topic sender connected (topic: ${topicName})`);
      } catch (err) {
        this.logger.warn('Azure Service Bus not configured or @azure/service-bus package missing');
      }
    } else {
      this.logger.warn('AZURE_SERVICE_BUS_CONNECTION_STRING not set — processing jobs will be unavailable');
    }
  }

  async sendRecordingJob(recordingId: string, blobUrl: string) {
    if (!this.sender) {
      this.logger.warn(`Skipping Service Bus job for recording ${recordingId} — not configured`);
      return;
    }
    const message = {
      body: {
        recordingId,
        blobUrl,
      },
      applicationProperties: {
        type: 'recording_processing',
      },
    };
    await this.sender.sendMessages(message);
    this.logger.log(`Published recording job to Topic for recording ${recordingId}`);
  }

  async onModuleDestroy() {
    if (this.sender) await this.sender.close();
    if (this.serviceBusClient) await this.serviceBusClient.close();
  }
}
