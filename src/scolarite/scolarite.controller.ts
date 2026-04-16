import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ScolariteService } from './scolarite.service';
import { CreateScolariteConfigDto } from './dto/create-scolarite-config.dto';
import { UpdateScolariteConfigDto } from './dto/update-scolarite-config.dto';
import { CreateScolariteEtudiantDto } from './dto/create-scolarite-etudiant.dto';
import { CreateVersementScolariteDto } from './dto/create-versement-scolarite.dto';
import { CreateEcheancierScolariteDto } from './dto/create-echeancier-scolarite.dto';

@ApiTags('scolarite')
@Controller('scolarite')
export class ScolariteController {
  constructor(private readonly scolariteService: ScolariteService) {}

  // ─── Config ──────────────────────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Lister toutes les configurations de scolarité' })
  findAllConfigs() {
    return this.scolariteService.findAllConfigs();
  }

  @Get('config/:id')
  @ApiOperation({ summary: 'Obtenir une configuration de scolarité par ID' })
  @ApiParam({ name: 'id' })
  findOneConfig(@Param('id') id: string) {
    return this.scolariteService.findOneConfig(id);
  }

  @Post('config')
  @ApiOperation({ summary: 'Créer une configuration de scolarité' })
  @ApiBody({ type: CreateScolariteConfigDto })
  createConfig(@Body() dto: CreateScolariteConfigDto) {
    return this.scolariteService.createConfig(dto);
  }

  @Put('config/:id')
  @ApiOperation({ summary: 'Mettre à jour une configuration de scolarité' })
  @ApiParam({ name: 'id' })
  updateConfig(@Param('id') id: string, @Body() dto: UpdateScolariteConfigDto) {
    return this.scolariteService.updateConfig(id, dto);
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une configuration de scolarité' })
  @ApiParam({ name: 'id' })
  removeConfig(@Param('id') id: string) {
    return this.scolariteService.removeConfig(id);
  }

  // ─── Échéancier (plan de paiement) ───────────────────────────────────────────

  @Get('echeancier/config/:configId')
  @ApiOperation({ summary: 'Plan de paiement d\'une configuration (nombre de versements, montants, dates limites)' })
  @ApiParam({ name: 'configId', description: 'ID de la configuration scolarité' })
  @ApiResponse({ status: 200, description: 'Liste des échéances du plan' })
  findEcheancierByConfig(@Param('configId') configId: string) {
    return this.scolariteService.findEcheancierByConfig(configId);
  }

  @Post('echeancier')
  @ApiOperation({ summary: 'Ajouter une échéance au plan de paiement d\'une configuration' })
  @ApiBody({ type: CreateEcheancierScolariteDto })
  @ApiResponse({ status: 201, description: 'Échéance ajoutée au plan' })
  @ApiResponse({ status: 400, description: 'Numéro d\'échéance déjà utilisé pour cette config' })
  createEcheancier(@Body() dto: CreateEcheancierScolariteDto) {
    return this.scolariteService.createEcheancier(dto);
  }

  @Delete('echeancier/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une échéance du plan de paiement' })
  @ApiParam({ name: 'id' })
  removeEcheancier(@Param('id') id: string) {
    return this.scolariteService.removeEcheancier(id);
  }

  // ─── Scolarité étudiant ──────────────────────────────────────────────────────

  @Get('etudiants')
  @ApiOperation({ summary: 'Lister toutes les scolarités étudiants (admin)' })
  findAllEtudiants() {
    return this.scolariteService.findAllEtudiants();
  }

  @Get('etudiants/:id')
  @ApiOperation({ summary: 'Obtenir la scolarité d\'un étudiant par ID' })
  @ApiParam({ name: 'id' })
  findOneEtudiant(@Param('id') id: string) {
    return this.scolariteService.findOneEtudiant(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtenir toutes les scolarités d\'un étudiant (par userId)' })
  @ApiParam({ name: 'userId' })
  findByUser(@Param('userId') userId: string) {
    return this.scolariteService.findByUser(userId);
  }

  @Get('user/:userId/dashboard')
  @ApiOperation({
    summary: 'Tableau de bord scolarité temps réel d\'un étudiant',
    description: 'Retourne les scolarités avec leurs échéances (montants, dates limites, statuts) et tous les versements effectués',
  })
  @ApiParam({ name: 'userId' })
  getDashboard(@Param('userId') userId: string) {
    return this.scolariteService.getDashboardEtudiant(userId);
  }

  @Post('etudiants')
  @ApiOperation({
    summary: 'Assigner une scolarité à un étudiant',
    description: 'Crée la scolarité et génère automatiquement les échéances depuis le plan de la configuration',
  })
  @ApiBody({ type: CreateScolariteEtudiantDto })
  @ApiResponse({ status: 201, description: 'Scolarité assignée avec ses échéances générées' })
  createEtudiant(@Body() dto: CreateScolariteEtudiantDto) {
    return this.scolariteService.createEtudiant(dto);
  }

  @Delete('etudiants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer la scolarité d\'un étudiant' })
  @ApiParam({ name: 'id' })
  removeEtudiant(@Param('id') id: string) {
    return this.scolariteService.removeEtudiant(id);
  }

  // ─── Échéances étudiant ───────────────────────────────────────────────────────

  @Get('echeances/etudiant/:scolariteEtudiantId')
  @ApiOperation({ summary: 'Lister les échéances d\'une scolarité étudiant (avec statuts)' })
  @ApiParam({ name: 'scolariteEtudiantId' })
  findEcheancesByEtudiant(@Param('scolariteEtudiantId') id: string) {
    return this.scolariteService.findEcheancesByEtudiant(id);
  }

  @Get('echeances/user/:userId')
  @ApiOperation({ summary: 'Toutes les échéances scolarité d\'un utilisateur' })
  @ApiParam({ name: 'userId' })
  findEcheancesByUser(@Param('userId') userId: string) {
    return this.scolariteService.findEcheancesByUser(userId);
  }

  // ─── Versements ──────────────────────────────────────────────────────────────

  @Get('versements/scolarite/:scolariteEtudiantId')
  @ApiOperation({ summary: 'Lister les versements d\'une scolarité étudiant' })
  @ApiParam({ name: 'scolariteEtudiantId' })
  findVersementsByEtudiant(@Param('scolariteEtudiantId') id: string) {
    return this.scolariteService.findVersementsByEtudiant(id);
  }

  @Get('versements/user/:userId')
  @ApiOperation({ summary: 'Tous les versements scolarité d\'un utilisateur' })
  @ApiParam({ name: 'userId' })
  findVersementsByUser(@Param('userId') userId: string) {
    return this.scolariteService.findVersementsByUser(userId);
  }

  @Post('versements')
  @ApiOperation({
    summary: 'Enregistrer un versement de scolarité',
    description: 'Si echeanceEtudiantId est fourni, met à jour le statut de l\'échéance ciblée. Met à jour le montantPaye global de la scolarité.',
  })
  @ApiBody({ type: CreateVersementScolariteDto })
  @ApiResponse({ status: 201, description: 'Versement enregistré — retourne le versement, la scolarité et l\'échéance mis à jour' })
  @ApiResponse({ status: 400, description: 'Montant dépasse le restant dû' })
  createVersement(@Body() dto: CreateVersementScolariteDto) {
    return this.scolariteService.createVersement(dto);
  }
}

