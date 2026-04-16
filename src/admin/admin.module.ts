import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { adminProviders } from '../../providers/admin.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...adminProviders, AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
