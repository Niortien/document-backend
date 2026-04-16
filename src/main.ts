import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors({ origin: true, credentials: true });

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Servir les fichiers uploadés via GET /uploads/nom-fichier
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Document Backend API')
    .setDescription('API documentation for document management system')
    .setVersion('1.0')
    .addTag('app')
    .addTag('users')
    .addTag('documents')
    .addTag('filieres')
    .addTag('matieres')
    .addTag('niveaux')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 8002);
}
bootstrap();
