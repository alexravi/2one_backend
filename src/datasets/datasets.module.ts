import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetsService } from './datasets.service';
import { DatasetsController } from './datasets.controller';
import { Recording } from '../recordings/entities/recording.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recording])],
  providers: [DatasetsService],
  controllers: [DatasetsController],
})
export class DatasetsModule {}
