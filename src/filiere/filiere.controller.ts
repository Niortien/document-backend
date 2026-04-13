import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { FiliereService } from './filiere.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { Filiere } from '../database/entities/filiere.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('filieres')
@Controller('filieres')
export class FiliereController {
  constructor(private readonly filiereService: FiliereService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les filières', description: 'Récupérer toutes les filières' })
  @ApiResponse({ status: 200, description: 'Liste des filières récupérée avec succès', type: [Filiere] })
  findAll(): Promise<Filiere[]> {
    return this.filiereService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une filière par ID', description: 'Récupérer une filière spécifique par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la filière', type: 'string' })
  @ApiResponse({ status: 200, description: 'Filière récupérée avec succès', type: Filiere })
  @ApiResponse({ status: 404, description: 'Filière non trouvée' })
  async findOne(@Param('id') id: string): Promise<Filiere> {
    const filiere = await this.filiereService.findOne(id);
    if (!filiere) throw new HttpException('Filière non trouvée', HttpStatus.NOT_FOUND);
    return filiere;
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle filière', description: 'Créer une nouvelle filière avec les données fournies' })
  @ApiBody({ type: CreateFiliereDto, description: 'Données de la filière à créer' })
  @ApiResponse({ status: 201, description: 'Filière créée avec succès', type: Filiere })
  @ApiResponse({ status: 400, description: 'Données d\'entrée invalides' })
  @ApiResponse({ status: 409, description: 'Code de filière déjà existant' })
  async create(@Body() dto: CreateFiliereDto): Promise<Filiere> {
    const existing = await this.filiereService.findByCode(dto.code);
    if (existing) throw new HttpException('Ce code de filière existe déjà', HttpStatus.CONFLICT);
    return this.filiereService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une filière', description: 'Mettre à jour une filière existante avec de nouvelles données' })
  @ApiParam({ name: 'id', description: 'ID de la filière', type: 'string' })
  @ApiBody({ type: UpdateFiliereDto, description: 'Données de la filière à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Filière mise à jour avec succès', type: Filiere })
  @ApiResponse({ status: 404, description: 'Filière non trouvée' })
  @ApiResponse({ status: 409, description: 'Code de filière déjà existant' })
  async update(@Param('id') id: string, @Body() dto: UpdateFiliereDto): Promise<Filiere> {
    const filiere = await this.filiereService.findOne(id);
    if (!filiere) throw new HttpException('Filière non trouvée', HttpStatus.NOT_FOUND);
    if (dto.code && dto.code !== filiere.code) {
      const existing = await this.filiereService.findByCode(dto.code);
      if (existing) throw new HttpException('Ce code de filière existe déjà', HttpStatus.CONFLICT);
    }
    return this.filiereService.update(id, dto) as Promise<Filiere>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une filière', description: 'Supprimer une filière par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la filière', type: 'string' })
  @ApiResponse({ status: 200, description: 'Filière supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Filière non trouvée' })
  async remove(@Param('id') id: string): Promise<void> {
    const filiere = await this.filiereService.findOne(id);
    if (!filiere) throw new HttpException('Filière non trouvée', HttpStatus.NOT_FOUND);
    return this.filiereService.remove(id);
  }
}
