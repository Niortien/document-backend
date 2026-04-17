import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/module/database.module';
import { ProfesseurService } from './professeur.service';
import { ProfesseurController } from './professeur.controller';
import { professeurMatiereProviders } from '../../providers/professeur-matiere.providers';
import { userProviders } from '../../providers/user.providers';
import { matiereProviders } from '../../providers/matiere.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfesseurController],
  providers: [...professeurMatiereProviders, ...userProviders, ...matiereProviders, ProfesseurService],
  exports: [ProfesseurService],
})
export class ProfesseurModule {}
