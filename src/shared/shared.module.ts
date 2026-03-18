import { Global, Module } from '@nestjs/common';
import { AzureBlobService } from './azure/azure-blob.service';
import { AzureServiceBusService } from './azure/azure-service-bus.service';

@Global()
@Module({
  providers: [AzureBlobService, AzureServiceBusService],
  exports: [AzureBlobService, AzureServiceBusService],
})
export class SharedModule {}
