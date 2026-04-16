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
import { TransportService } from './transport.service';
import { CreateTransportConfigDto } from './dto/create-transport-config.dto';
import { UpdateTransportConfigDto } from './dto/update-transport-config.dto';
import { CreateTransportAbonnementDto } from './dto/create-transport-abonnement.dto';
import { CreateVersementTransportDto } from './dto/create-versement-transport.dto';

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  // ─── Config ──────────────────────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Lister toutes les configurations de transport' })
  @ApiResponse({ status: 200, description: 'Liste des configurations' })
  findAllConfigs() {
    return this.transportService.findAllConfigs();
  }

  @Get('config/:id')
  @ApiOperation({ summary: 'Obtenir une configuration de transport par ID' })
  @ApiParam({ name: 'id', description: 'ID de la configuration' })
  @ApiResponse({ status: 200, description: 'Configuration trouvée' })
  @ApiResponse({ status: 404, description: 'Configuration introuvable' })
  findOneConfig(@Param('id') id: string) {
    return this.transportService.findOneConfig(id);
  }

  @Post('config')
  @ApiOperation({ summary: 'Créer une configuration de transport' })
  @ApiBody({ type: CreateTransportConfigDto })
  @ApiResponse({ status: 201, description: 'Configuration créée' })
  createConfig(@Body() dto: CreateTransportConfigDto) {
    return this.transportService.createConfig(dto);
  }

  @Put('config/:id')
  @ApiOperation({ summary: 'Mettre à jour une configuration de transport' })
  @ApiParam({ name: 'id', description: 'ID de la configuration' })
  @ApiBody({ type: UpdateTransportConfigDto })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour' })
  updateConfig(@Param('id') id: string, @Body() dto: UpdateTransportConfigDto) {
    return this.transportService.updateConfig(id, dto);
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une configuration de transport' })
  @ApiParam({ name: 'id', description: 'ID de la configuration' })
  @ApiResponse({ status: 204, description: 'Configuration supprimée' })
  removeConfig(@Param('id') id: string) {
    return this.transportService.removeConfig(id);
  }

  // ─── Abonnements ──────────────────────────────────────────────────────────────

  @Get('abonnements')
  @ApiOperation({ summary: 'Lister tous les abonnements transport' })
  @ApiResponse({ status: 200, description: 'Liste des abonnements' })
  findAllAbonnements() {
    return this.transportService.findAllAbonnements();
  }

  @Get('abonnements/:id')
  @ApiOperation({ summary: 'Obtenir un abonnement par ID' })
  @ApiParam({ name: 'id', description: "ID de l'abonnement" })
  @ApiResponse({ status: 200, description: 'Abonnement trouvé' })
  @ApiResponse({ status: 404, description: 'Abonnement introuvable' })
  findOneAbonnement(@Param('id') id: string) {
    return this.transportService.findOneAbonnement(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Obtenir tous les abonnements transport d'un étudiant" })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: "Abonnements de l'étudiant" })
  findByUser(@Param('userId') userId: string) {
    return this.transportService.findByUser(userId);
  }

  @Get('user/:userId/dashboard')
  @ApiOperation({ summary: "Tableau de bord transport d'un étudiant (abonnements + versements)" })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Tableau de bord avec abonnements et versements' })
  getDashboard(@Param('userId') userId: string) {
    return this.transportService.getDashboardEtudiant(userId);
  }

  @Post('abonnements')
  @ApiOperation({ summary: "Créer un abonnement transport pour un étudiant" })
  @ApiBody({ type: CreateTransportAbonnementDto })
  @ApiResponse({ status: 201, description: 'Abonnement créé' })
  @ApiResponse({ status: 400, description: 'Abonnement déjà existant pour cette période' })
  createAbonnement(@Body() dto: CreateTransportAbonnementDto) {
    return this.transportService.createAbonnement(dto);
  }

  @Delete('abonnements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer un abonnement transport" })
  @ApiParam({ name: 'id', description: "ID de l'abonnement" })
  @ApiResponse({ status: 204, description: 'Abonnement supprimé' })
  removeAbonnement(@Param('id') id: string) {
    return this.transportService.removeAbonnement(id);
  }

  // ─── Versements ──────────────────────────────────────────────────────────────

  @Get('versements/abonnement/:transportAbonnementId')
  @ApiOperation({ summary: "Lister les versements d'un abonnement transport" })
  @ApiParam({ name: 'transportAbonnementId', description: "ID de l'abonnement" })
  @ApiResponse({ status: 200, description: 'Liste des versements' })
  findVersementsByAbonnement(@Param('transportAbonnementId') id: string) {
    return this.transportService.findVersementsByAbonnement(id);
  }

  @Get('versements/user/:userId')
  @ApiOperation({ summary: "Lister tous les versements transport d'un utilisateur" })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Liste des versements' })
  findVersementsByUser(@Param('userId') userId: string) {
    return this.transportService.findVersementsByUser(userId);
  }

  @Post('versements')
  @ApiOperation({ summary: 'Enregistrer un versement de transport' })
  @ApiBody({ type: CreateVersementTransportDto })
  @ApiResponse({ status: 201, description: 'Versement enregistré, abonnement mis à jour' })
  @ApiResponse({ status: 400, description: 'Montant dépasse le restant dû' })
  createVersement(@Body() dto: CreateVersementTransportDto) {
    return this.transportService.createVersement(dto);
  }
}
