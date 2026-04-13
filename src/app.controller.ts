import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Point de vérification de santé', description: 'Retourne un message de bienvenue pour vérifier que l\'API fonctionne' })
  @ApiResponse({ status: 200, description: 'Message de bienvenue retourné avec succès' })
  getHello(): string {
    return this.appService.getHello();
  }
}
