import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProviders } from '../../providers/user.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    ...userProviders,
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}
