import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { ScolariteService } from './scolarite.service';
import { ScolariteController } from './scolarite.controller';
import { scolariteProviders } from '../../providers/scolarite.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ScolariteController],
  providers: [...scolariteProviders, ScolariteService],
  exports: [ScolariteService],
})
export class ScolariteModule {}
