import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfesseurService } from './professeur.service';
import { AssignMatiereDto } from './dto/assign-matiere.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@ApiTags('professeur')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('professeur')
export class ProfesseurController {
  constructor(private readonly professeurService: ProfesseurService) {}

  // ────────────────────────────────────────────────────────────────
  // Espace professeur connecté
  // ────────────────────────────────────────────────────────────────

  @Get('mes-classes')
  @Roles(UserRole.PROFESSEUR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mes classes',
    description: 'Retourne les classes (filière + niveau) déduites des matières assignées.',
  })
  @ApiResponse({ status: 200, description: 'Résumé des classes du professeur' })
  getMesClasses(@Request() req: { user: { id: string } }) {
    return this.professeurService.getMesClasses(req.user.id);
  }

  @Get('mes-matieres')
  @Roles(UserRole.PROFESSEUR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mes matières',
    description: 'Liste des matières assignées au professeur connecté.',
  })
  @ApiResponse({ status: 200, description: 'Liste des matières du professeur' })
  getMesMatieres(@Request() req: { user: { id: string } }) {
    return this.professeurService.getMesMatieres(req.user.id);
  }

  // ────────────────────────────────────────────────────────────────
  // Administration (admin seulement)
  // ────────────────────────────────────────────────────────────────

  @Get('liste')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lister tous les professeurs (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des professeurs' })
  getAllProfesseurs() {
    return this.professeurService.getAllProfesseurs();
  }

  @Get(':professeurId/matieres')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Matières assignées à un professeur (admin)' })
  @ApiParam({ name: 'professeurId', description: 'ID du professeur' })
  @ApiResponse({ status: 200, description: 'Liste des affectations matières' })
  getMatieresOfProfesseur(@Param('professeurId') professeurId: string) {
    return this.professeurService.getMatieresOfProfesseur(professeurId);
  }

  @Post(':professeurId/matieres')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assigner une matière à un professeur (admin)',
    description: 'Le professeur pourra ensuite gérer les notes de cette matière uniquement.',
  })
  @ApiParam({ name: 'professeurId', description: 'ID du professeur' })
  @ApiResponse({ status: 201, description: 'Matière assignée' })
  @ApiResponse({ status: 409, description: 'Déjà assigné' })
  assignMatiere(
    @Param('professeurId') professeurId: string,
    @Body() dto: AssignMatiereDto,
  ) {
    return this.professeurService.assignMatiere(professeurId, dto);
  }

  @Delete('matieres/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer une matière d\'un professeur (admin)' })
  @ApiParam({ name: 'id', description: 'ID de l\'affectation' })
  @ApiResponse({ status: 204, description: 'Affectation supprimée' })
  removeMatiere(@Param('id') id: string) {
    return this.professeurService.removeMatiere(id);
  }
}
