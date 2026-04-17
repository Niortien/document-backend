import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { noteProviders } from '../../providers/note.providers';
import { matiereProviders } from '../../providers/matiere.providers';
import { ProfesseurModule } from '../professeur/professeur.module';

@Module({
  imports: [DatabaseModule, ProfesseurModule],
  controllers: [NotesController],
  providers: [...noteProviders, ...matiereProviders, NotesService],
  exports: [NotesService],
})
export class NotesModule {}
