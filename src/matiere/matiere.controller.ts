import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus, Query } from '@nestjs/common';
import { MatiereService } from './matiere.service';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';
import { Matiere } from '../database/entities/matiere.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('matieres')
@Controller('matieres')
export class MatiereController {
  constructor(private readonly matiereService: MatiereService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les matières', description: 'Récupérer toutes les matières avec filtrage optionnel par filière ou niveau' })
  @ApiQuery({ name: 'filiereId', required: false, description: 'Filtrer par ID de filière' })
  @ApiQuery({ name: 'niveauId', required: false, description: 'Filtrer par ID de niveau' })
  @ApiResponse({ status: 200, description: 'Liste des matières récupérée avec succès', type: [Matiere] })
  findAll(
    @Query('filiereId') filiereId?: string,
    @Query('niveauId') niveauId?: string,
  ): Promise<Matiere[]> {
    if (filiereId) return this.matiereService.findByFiliere(filiereId);
    if (niveauId) return this.matiereService.findByNiveau(niveauId);
    return this.matiereService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une matière par ID', description: 'Récupérer une matière spécifique par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la matière', type: 'string' })
  @ApiResponse({ status: 200, description: 'Matière récupérée avec succès', type: Matiere })
  @ApiResponse({ status: 404, description: 'Matière non trouvée' })
  async findOne(@Param('id') id: string): Promise<Matiere> {
    const matiere = await this.matiereService.findOne(id);
    if (!matiere) throw new HttpException('Matière non trouvée', HttpStatus.NOT_FOUND);
    return matiere;
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle matière', description: 'Créer une nouvelle matière avec les données fournies' })
  @ApiBody({ type: CreateMatiereDto, description: 'Données de la matière à créer' })
  @ApiResponse({ status: 201, description: 'Matière créée avec succès', type: Matiere })
  @ApiResponse({ status: 400, description: 'Données d\'entrée invalides' })
  create(@Body() dto: CreateMatiereDto): Promise<Matiere> {
    return this.matiereService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une matière', description: 'Mettre à jour une matière existante avec de nouvelles données' })
  @ApiParam({ name: 'id', description: 'ID de la matière', type: 'string' })
  @ApiBody({ type: UpdateMatiereDto, description: 'Données de la matière à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Matière mise à jour avec succès', type: Matiere })
  @ApiResponse({ status: 404, description: 'Matière non trouvée' })
  async update(@Param('id') id: string, @Body() dto: UpdateMatiereDto): Promise<Matiere> {
    const matiere = await this.matiereService.findOne(id);
    if (!matiere) throw new HttpException('Matière non trouvée', HttpStatus.NOT_FOUND);
    return this.matiereService.update(id, dto) as Promise<Matiere>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une matière', description: 'Supprimer une matière par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la matière', type: 'string' })
  @ApiResponse({ status: 200, description: 'Matière supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Matière non trouvée' })
  async remove(@Param('id') id: string): Promise<void> {
    const matiere = await this.matiereService.findOne(id);
    if (!matiere) throw new HttpException('Matière non trouvée', HttpStatus.NOT_FOUND);
    return this.matiereService.remove(id);
  }
}
