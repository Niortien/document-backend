import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur', description: 'Authentifie un utilisateur et retourne un token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie', schema: { example: { access_token: 'eyJhbGciOiJIUzI1NiIs...', refresh_token: 'eyJhbGciOiJIUzI1NiIs...', user: { id: '...', email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', role: 'etudiant', isActive: true } } } })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir les tokens', description: 'Génère un nouvel access token via le refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens renouvelés', schema: { example: { access_token: 'eyJhbGciOiJIUzI1NiIs...', refresh_token: 'eyJhbGciOiJIUzI1NiIs...' } } })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
