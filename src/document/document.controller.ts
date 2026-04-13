import {
  Controller, Get, Post, Body, Param, Delete, Put,
  HttpException, HttpStatus, Query, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document, FileType } from '../database/entities/document.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';

const ALLOWED_MIMETYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Seuls les fichiers PDF et images sont autorisés'), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
};

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les documents', description: 'Récupérer tous les documents avec filtrage optionnel par filière, niveau ou matière' })
  @ApiQuery({ name: 'filiereId', required: false, description: 'Filtrer par ID de filière' })
  @ApiQuery({ name: 'niveauId', required: false, description: 'Filtrer par ID de niveau' })
  @ApiQuery({ name: 'matiereId', required: false, description: 'Filtrer par ID de matière' })
  @ApiResponse({ status: 200, description: 'Liste des documents récupérée avec succès', type: [Document] })
  findAll(
    @Query('filiereId') filiereId?: string,
    @Query('niveauId') niveauId?: string,
    @Query('matiereId') matiereId?: string,
  ): Promise<Document[]> {
    if (matiereId) return this.documentService.findByMatiere(matiereId);
    if (niveauId) return this.documentService.findByNiveau(niveauId);
    if (filiereId) return this.documentService.findByFiliere(filiereId);
    return this.documentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un document par ID', description: 'Récupérer un document spécifique par son ID' })
  @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
  @ApiResponse({ status: 200, description: 'Document récupéré avec succès', type: Document })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async findOne(@Param('id') id: string): Promise<Document> {
    const doc = await this.documentService.findOne(id);
    if (!doc) throw new HttpException('Document non trouvé', HttpStatus.NOT_FOUND);
    return doc;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un document avec fichier', description: 'Upload un fichier PDF ou image et crée le document associé' })
  @ApiResponse({ status: 201, description: 'Document créé avec succès', type: Document })
  @ApiResponse({ status: 400, description: 'Fichier manquant ou type non autorisé' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
  ): Promise<Document> {
    if (!file) throw new BadRequestException('Un fichier PDF ou image est requis');
    const fileType = file.mimetype === 'application/pdf' ? FileType.PDF : FileType.IMAGE;
    return this.documentService.create({ ...dto, fileUrl: `uploads/${file.filename}`, fileType });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un document', description: 'Mettre à jour un document existant avec de nouvelles données' })
  @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
  @ApiBody({ type: UpdateDocumentDto, description: 'Données du document à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Document mis à jour avec succès', type: Document })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto): Promise<Document> {
    const doc = await this.documentService.findOne(id);
    if (!doc) throw new HttpException('Document non trouvé', HttpStatus.NOT_FOUND);
    return this.documentService.update(id, dto) as Promise<Document>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document', description: 'Supprimer un document par son ID' })
  @ApiParam({ name: 'id', description: 'ID du document', type: 'string' })
  @ApiResponse({ status: 200, description: 'Document supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async remove(@Param('id') id: string): Promise<void> {
    const doc = await this.documentService.findOne(id);
    if (!doc) throw new HttpException('Document non trouvé', HttpStatus.NOT_FOUND);
    return this.documentService.remove(id);
  }
}
