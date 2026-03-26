import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PalmSubmissionsService } from './services/palm-submissions.service';
import { PalmSubmissionsController } from './controllers/palm-submissions.controller';
import { PalmPhoto } from './entities/palm-photo.entity';
import { PalmSubmission } from './entities/palm-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PalmSubmission, PalmPhoto])],
  providers: [PalmSubmissionsService],
  controllers: [PalmSubmissionsController],
  exports: [PalmSubmissionsService],
})
export class PalmsModule {}

