import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { documentProviders } from '../../providers/document.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [DocumentController],
  providers: [...documentProviders, DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
