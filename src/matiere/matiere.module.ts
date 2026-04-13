import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { MatiereService } from './matiere.service';
import { MatiereController } from './matiere.controller';
import { matiereProviders } from '../../providers/matiere.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [MatiereController],
  providers: [...matiereProviders, MatiereService],
  exports: [MatiereService],
})
export class MatiereModule {}
