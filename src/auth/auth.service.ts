import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'change_this_refresh_secret_in_production';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string; refresh_token: string; user: Omit<import('../database/entities/user.entity').User, 'password'> }> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { password: _password, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { secret: REFRESH_SECRET, expiresIn: '30d' },
      ),
      user: userWithoutPassword,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<{ access_token: string; refresh_token: string }> {
    let payload: { sub: string; type: string };

    try {
      payload = this.jwtService.verify(dto.refresh_token, { secret: REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token invalide');
    }

    const user = await this.userService.findOne(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur introuvable ou inactif');
    }

    const newPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(newPayload),
      refresh_token: this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { secret: REFRESH_SECRET, expiresIn: '30d' },
      ),
    };
  }
}
