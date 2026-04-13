import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { FiliereModule } from './filiere/filiere.module';
import { NiveauModule } from './niveau/niveau.module';
import { MatiereModule } from './matiere/matiere.module';
import { DocumentModule } from './document/document.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, UserModule, FiliereModule, NiveauModule, MatiereModule, DocumentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
