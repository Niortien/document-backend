import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { NiveauService } from './niveau.service';
import { NiveauController } from './niveau.controller';
import { niveauProviders } from '../../providers/niveau.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [NiveauController],
  providers: [...niveauProviders, NiveauService],
  exports: [NiveauService],
})
export class NiveauModule {}
