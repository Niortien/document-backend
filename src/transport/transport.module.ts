import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { transportProviders } from '../../providers/transport.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [TransportController],
  providers: [...transportProviders, TransportService],
  exports: [TransportService],
})
export class TransportModule {}
