import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { FiliereService } from './filiere.service';
import { FiliereController } from './filiere.controller';
import { filiereProviders } from '../../providers/filiere.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [FiliereController],
  providers: [...filiereProviders, FiliereService],
  exports: [FiliereService],
})
export class FiliereModule {}
