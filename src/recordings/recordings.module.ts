import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordingsService } from './recordings.service';
import { RecordingsController } from './recordings.controller';
import { Recording } from './entities/recording.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recording])],
  providers: [RecordingsService],
  controllers: [RecordingsController],
  exports: [RecordingsService],
})
export class RecordingsModule {}
