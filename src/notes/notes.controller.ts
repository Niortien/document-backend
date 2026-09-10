import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { SaisirSessionDto } from './dto/saisir-session.dto';
import { FindNotesDto } from './dto/find-notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { NoteEtudiant, StatutNote } from '../database/entities/note-etudiant.entity';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // ──────────────────────────────────────────────────────────────────
  // Saisie des notes (Admin / Professeur)
  // ──────────────────────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({
    summary: 'Saisir les notes d\'un étudiant',
    description:
      'Crée une entrée de note pour un étudiant dans une matière. ' +
      'La moyenne matière est calculée automatiquement (classe×0.4 + examen×0.6). ' +
      'Le statut (validé / en session) est déduit automatiquement.',
  })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({ status: 201, description: 'Note créée avec succès', type: NoteEtudiant })
  @ApiResponse({ status: 400, description: 'Données invalides ou matière de type module' })
  @ApiResponse({ status: 409, description: 'Note déjà saisie pour cet étudiant/matière/année' })
  create(
    @Body() dto: CreateNoteDto,
    @Request() req: { user: { id: string; role: string } },
  ): Promise<NoteEtudiant> {
    return this.notesService.create(dto, req.user.id, req.user.role);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({
    summary: 'Mettre à jour les notes d\'un étudiant',
    description:
      'Met à jour la moyenne de classe et/ou d\'examen. ' +
      'Recalcule automatiquement la moyenne matière et le statut.',
  })
  @ApiParam({ name: 'id', description: 'ID de la note' })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({ status: 200, description: 'Note mise à jour', type: NoteEtudiant })
  @ApiResponse({ status: 404, description: 'Note non trouvée' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @Request() req: { user: { id: string; role: string } },
  ): Promise<NoteEtudiant> {
    return this.notesService.update(id, dto, req.user.id, req.user.role);
  }

  @Put(':id/session')
  @Roles(UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({
    summary: 'Saisir la note de session',
    description:
      'Saisit la note de session d\'un étudiant (uniquement si statut = en_session). ' +
      'Si moyenne session >= 10 → validé, sinon → ajourné.',
  })
  @ApiParam({ name: 'id', description: 'ID de la note' })
  @ApiBody({ type: SaisirSessionDto })
  @ApiResponse({ status: 200, description: 'Note de session saisie', type: NoteEtudiant })
  @ApiResponse({ status: 400, description: 'L\'étudiant n\'est pas en session' })
  @ApiResponse({ status: 404, description: 'Note non trouvée' })
  saisirSession(
    @Param('id') id: string,
    @Body() dto: SaisirSessionDto,
    @Request() req: { user: { id: string; role: string } },
  ): Promise<NoteEtudiant> {
    return this.notesService.saisirSession(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROFESSEUR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une note' })
  @ApiParam({ name: 'id', description: 'ID de la note' })
  @ApiResponse({ status: 204, description: 'Note supprimée' })
  @ApiResponse({ status: 404, description: 'Note non trouvée' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ): Promise<void> {
    return this.notesService.remove(id, req.user.id, req.user.role);
  }

  // ──────────────────────────────────────────────────────────────────
  // Consultation
  // ──────────────────────────────────────────────────────────────────

  @Get('mon-bulletin')
  @ApiOperation({
    summary: 'Consulter mon bulletin (étudiant)',
    description: 'L\'étudiant connecté consulte son propre bulletin en temps réel.',
  })
  @ApiQuery({ name: 'anneeAcademique', required: true, description: 'Ex: 2025-2026' })
  @ApiResponse({ status: 200, description: 'Bulletin de l\'étudiant connecté' })
  getMonBulletin(
    @Request() req: { user: { id: string } },
    @Query('anneeAcademique') anneeAcademique: string,
  ) {
    return this.notesService.getBulletin(req.user.id, anneeAcademique);
  }

  // ──────────────────────────────────────────────────────────────────
  // Bulletin
  // ──────────────────────────────────────────────────────────────────

  @Get('bulletin/:etudiantId')
  @ApiOperation({
    summary: 'Bulletin complet d\'un étudiant',
    description:
      'Retourne toutes les notes d\'un étudiant pour une année académique, ' +
      'les résultats par module complémentaire et la moyenne générale.',
  })
  @ApiParam({ name: 'etudiantId', description: 'ID de l\'étudiant' })
  @ApiQuery({ name: 'anneeAcademique', required: true, description: 'Ex: 2025-2026' })
  @ApiResponse({ status: 200, description: 'Bulletin de l\'étudiant' })
  getBulletin(
    @Param('etudiantId') etudiantId: string,
    @Query('anneeAcademique') anneeAcademique: string,
  ) {
    return this.notesService.getBulletin(etudiantId, anneeAcademique);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les notes avec filtres',
    description:
      'Filtres disponibles : anneeAcademique, etudiantId, matiereId, filiereId, niveauId, statut.',
  })
  @ApiQuery({ name: 'anneeAcademique', required: false, description: 'Année académique, ex: 2025-2026' })
  @ApiQuery({ name: 'etudiantId', required: false, description: 'ID de l\'étudiant' })
  @ApiQuery({ name: 'matiereId', required: false, description: 'ID de la matière' })
  @ApiQuery({ name: 'filiereId', required: false, description: 'ID de la filière' })
  @ApiQuery({ name: 'niveauId', required: false, description: 'ID du niveau' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutNote, description: 'Statut de la note' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par prénom ou nom de l\'étudiant' })
  @ApiResponse({ status: 200, description: 'Liste des notes filtrées', type: [NoteEtudiant] })
  findAll(@Query() filters: FindNotesDto): Promise<NoteEtudiant[]> {
    return this.notesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une note par ID' })
  @ApiParam({ name: 'id', description: 'ID de la note' })
  @ApiResponse({ status: 200, description: 'Note trouvée', type: NoteEtudiant })
  @ApiResponse({ status: 404, description: 'Note non trouvée' })
  async findOne(@Param('id') id: string): Promise<NoteEtudiant> {
    const note = await this.notesService.findOne(id);
    if (!note) throw new NotFoundException('Note non trouvée');
    return note;
  }
}
