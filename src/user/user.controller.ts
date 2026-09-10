import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus, UseInterceptors, UploadedFile, BadRequestException, Patch, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { User, UserRole } from '../database/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

type OptionalAuthedRequest = { user: { id: string; role: UserRole } | null };

const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const imageUploadOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Seuls les fichiers image sont autorisés (jpeg, png, gif, webp)'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
};

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs', description: 'Liste filtrée des utilisateurs' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par prénom, nom ou email' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filtrer par rôle' })
  @ApiQuery({ name: 'filiereId', required: false, description: 'Filtrer par ID filière' })
  @ApiQuery({ name: 'niveauId', required: false, description: 'Filtrer par ID niveau' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrer par statut actif/inactif' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès', type: [User] })
  async findAll(@Query() filters: FindUsersDto): Promise<User[]> {
    return this.userService.findAll(filters);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID', description: 'Récupérer un utilisateur spécifique par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur', type: 'string' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string): Promise<User | null> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Créer un nouvel utilisateur',
    description: 'Inscription publique (étudiant ou professeur) ou création par un administrateur. Seul un administrateur connecté peut créer un compte avec le rôle admin.',
  })
  @ApiBody({ type: CreateUserDto, description: 'Données de l\'utilisateur à créer' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: User })
  @ApiResponse({ status: 400, description: 'Données d\'entrée invalides' })
  @ApiResponse({ status: 403, description: 'Seul un administrateur peut créer un compte admin' })
  @ApiResponse({ status: 409, description: 'Email déjà existant' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: OptionalAuthedRequest,
  ): Promise<User> {
    if (createUserDto.role === UserRole.ADMIN && req.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un administrateur peut créer un compte avec le rôle admin.');
    }

    // Check if email already exists
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur', description: 'Mettre à jour un utilisateur existant avec de nouvelles données' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur', type: 'string' })
  @ApiBody({ type: UpdateUserDto, description: 'Données de l\'utilisateur à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour avec succès', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 409, description: 'Email déjà existant' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User | null> {
    // Check if user exists
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    // Check if email already exists (and it's not the same user)
    if (updateUserDto.email) {
      const existingUser = await this.userService.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }
    
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer un utilisateur', description: 'Supprimer un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur', type: 'string' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async remove(@Param('id') id: string): Promise<void> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.userService.remove(id);
  }

  @Patch(':id/image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploader une photo de profil', description: 'Uploader ou remplacer la photo de profil d\'un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur', type: 'string' })
  @ApiResponse({ status: 200, description: 'Photo de profil mise à jour', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User | null> {
    const user = await this.userService.findOne(id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!file) throw new BadRequestException('Un fichier image est requis');
    return this.userService.update(id, { imageUrl: `uploads/${file.filename}` });
  }
}
