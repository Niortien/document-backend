import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus, Query } from '@nestjs/common';
import { NiveauService } from './niveau.service';
import { CreateNiveauDto } from './dto/create-niveau.dto';
import { UpdateNiveauDto } from './dto/update-niveau.dto';
import { Niveau } from '../database/entities/niveau.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('niveaux')
@Controller('niveaux')
export class NiveauController {
  constructor(private readonly niveauService: NiveauService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les niveaux', description: 'Récupérer tous les niveaux avec filtrage optionnel par filière' })
  @ApiQuery({ name: 'filiereId', required: false, description: 'Filtrer par ID de filière' })
  @ApiResponse({ status: 200, description: 'Liste des niveaux récupérée avec succès', type: [Niveau] })
  findAll(@Query('filiereId') filiereId?: string): Promise<Niveau[]> {
    if (filiereId) return this.niveauService.findByFiliere(filiereId);
    return this.niveauService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un niveau par ID', description: 'Récupérer un niveau spécifique par son ID' })
  @ApiParam({ name: 'id', description: 'ID du niveau', type: 'string' })
  @ApiResponse({ status: 200, description: 'Niveau récupéré avec succès', type: Niveau })
  @ApiResponse({ status: 404, description: 'Niveau non trouvé' })
  async findOne(@Param('id') id: string): Promise<Niveau> {
    const niveau = await this.niveauService.findOne(id);
    if (!niveau) throw new HttpException('Niveau non trouvé', HttpStatus.NOT_FOUND);
    return niveau;
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau niveau', description: 'Créer un nouveau niveau avec les données fournies' })
  @ApiBody({ type: CreateNiveauDto, description: 'Données du niveau à créer' })
  @ApiResponse({ status: 201, description: 'Niveau créé avec succès', type: Niveau })
  @ApiResponse({ status: 400, description: 'Données d\'entrée invalides' })
  create(@Body() dto: CreateNiveauDto): Promise<Niveau> {
    return this.niveauService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un niveau', description: 'Mettre à jour un niveau existant avec de nouvelles données' })
  @ApiParam({ name: 'id', description: 'ID du niveau', type: 'string' })
  @ApiBody({ type: UpdateNiveauDto, description: 'Données du niveau à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Niveau mis à jour avec succès', type: Niveau })
  @ApiResponse({ status: 404, description: 'Niveau non trouvé' })
  async update(@Param('id') id: string, @Body() dto: UpdateNiveauDto): Promise<Niveau> {
    const niveau = await this.niveauService.findOne(id);
    if (!niveau) throw new HttpException('Niveau non trouvé', HttpStatus.NOT_FOUND);
    return this.niveauService.update(id, dto) as Promise<Niveau>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un niveau', description: 'Supprimer un niveau par son ID' })
  @ApiParam({ name: 'id', description: 'ID du niveau', type: 'string' })
  @ApiResponse({ status: 200, description: 'Niveau supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Niveau non trouvé' })
  async remove(@Param('id') id: string): Promise<void> {
    const niveau = await this.niveauService.findOne(id);
    if (!niveau) throw new HttpException('Niveau non trouvé', HttpStatus.NOT_FOUND);
    return this.niveauService.remove(id);
  }
}
