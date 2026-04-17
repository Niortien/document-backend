import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { FiliereModule } from './filiere/filiere.module';
import { NiveauModule } from './niveau/niveau.module';
import { MatiereModule } from './matiere/matiere.module';
import { DocumentModule } from './document/document.module';
import { AuthModule } from './auth/auth.module';
import { ScolariteModule } from './scolarite/scolarite.module';
import { TransportModule } from './transport/transport.module';
import { AdminModule } from './admin/admin.module';
import { NotesModule } from './notes/notes.module';
import { ProfesseurModule } from './professeur/professeur.module';

@Module({
  imports: [AuthModule, UserModule, FiliereModule, NiveauModule, MatiereModule, DocumentModule, ScolariteModule, TransportModule, AdminModule, NotesModule, ProfesseurModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
