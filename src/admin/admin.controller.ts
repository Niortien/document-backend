import { Controller, Get, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

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

