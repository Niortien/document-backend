import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus, UseInterceptors, UploadedFile, BadRequestException, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../database/entities/user.entity';

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
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs', description: 'Récupérer tous les utilisateurs triés par date de création' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès', type: [User] })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
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
  @ApiOperation({ summary: 'Créer un nouvel utilisateur', description: 'Créer un nouvel utilisateur avec les données fournies' })
  @ApiBody({ type: CreateUserDto, description: 'Données de l\'utilisateur à créer' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: User })
  @ApiResponse({ status: 400, description: 'Données d\'entrée invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà existant' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }
    return this.userService.create(createUserDto);
  }

  @Put(':id')
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
