import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/niveaux
  @Get('niveaux')
  getNiveauxGroupes() {
    return this.adminService.getNiveauxGroupes();
  }

  // GET /admin/niveaux/:niveauName/filieres
  @Get('niveaux/:niveauName/filieres')
  getFilieresByNiveauName(@Param('niveauName') niveauName: string) {
    return this.adminService.getFilieresByNiveauName(decodeURIComponent(niveauName));
  }

  // GET /admin/niveaux/:niveauId/overview
  @Get('niveaux/:niveauId/overview')
  getOverview(@Param('niveauId') niveauId: string) {
    return this.adminService.getOverview(niveauId);
  }

  // GET /admin/niveaux/:niveauId/etudiants
  @Get('niveaux/:niveauId/etudiants')
  getEtudiants(@Param('niveauId') niveauId: string) {
    return this.adminService.getEtudiants(niveauId);
  }
}

